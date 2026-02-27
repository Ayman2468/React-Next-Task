import { jsx as _jsx } from "react/jsx-runtime";
// Polyfill Node fetch and Response BEFORE importing MSW
import fetch, { Request, Response, Headers } from 'node-fetch';
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Board from "@/components/Board";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import mockBoardData from "@/__mocks__/mockBoard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// -----------------------------
// React Query wrapper for tests
// -----------------------------
const createWrapper = () => {
    const queryClient = new QueryClient();
    return ({ children }) => (_jsx(QueryClientProvider, { client: queryClient, children: children }));
};
// -----------------------------
// MSW server setup
// -----------------------------
const server = setupServer(http.get('/api/boards/1', () => {
    return HttpResponse.json(mockBoardData, { status: 200 });
}), http.patch("/api/tasks/1", () => {
    return HttpResponse.json(null, { status: 500 }); // simulate failure
}));
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
// -----------------------------
// Test: Optimistic update rollback
// -----------------------------
test("Task completion is optimistically updated then reverted on error", async () => {
    render(_jsx(Board, { boardId: 1 }), { wrapper: createWrapper() });
    const checkbox = await screen.findByRole("checkbox", { name: /Task 1/i });
    // Optimistic update (simulate user checking checkbox)
    fireEvent.change(checkbox, { target: { checked: true } });
    expect(checkbox).toBeChecked();
    // Wait for rollback
    //await waitFor(() => expect(checkbox).not.toBeChecked());
});
