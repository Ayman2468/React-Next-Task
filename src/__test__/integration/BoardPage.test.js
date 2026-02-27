import { jsx as _jsx } from "react/jsx-runtime";
// ==============================
// Polyfills (must be first)
// ==============================
import fetch, { Request, Response, Headers } from "node-fetch";
import { TextEncoder, TextDecoder } from "util";
// Polyfill global fetch / Request / Response / Headers
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
// Polyfill TextEncoder / TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
// Polyfill BroadcastChannel (used by react-query offline caching)
global.BroadcastChannel = class {
    constructor(name) { }
    postMessage() { }
    close() { }
};
// ==============================
// Now import MSW (AFTER polyfills)
// ==============================
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
// ==============================
// React Query Provider
// ==============================
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// ==============================
// Testing utilities
// ==============================
import { render, screen } from "@testing-library/react";
import Board from "@/components/Board";
import mockBoardData from "@/__mocks__/mockBoard";
// ==============================
// MSW Handlers
// ==============================
const server = setupServer(http.get("/api/boards/1", () => HttpResponse.json(mockBoardData)), http.post("/api/tasks", async ({ request }) => {
    const body = (await request.json());
    return HttpResponse.json({ ...body, id: Date.now() });
}));
// ==============================
// Server lifecycle
// ==============================
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
// ==============================
// QueryClient wrapper
// ==============================
const createWrapper = () => {
    const queryClient = new QueryClient();
    return ({ children }) => (_jsx(QueryClientProvider, { client: queryClient, children: children }));
};
// ==============================
// Tests
// ==============================
test("BoardPage displays tasks", async () => {
    render(_jsx(Board, { boardId: 1 }), { wrapper: createWrapper() });
    // Wait for the first task to appear
    const task1 = await screen.findByText("Task 1");
    expect(task1).toBeInTheDocument();
});
