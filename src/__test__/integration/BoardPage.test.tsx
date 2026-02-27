// ==============================
// Polyfills (must be first)
// ==============================
import fetch, { Request, Response, Headers } from "node-fetch";
import { TextEncoder, TextDecoder } from "util";

// Polyfill global fetch / Request / Response / Headers
(global as any).fetch = fetch;
(global as any).Request = Request;
(global as any).Response = Response;
(global as any).Headers = Headers;

// Polyfill TextEncoder / TextDecoder
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Polyfill BroadcastChannel (used by react-query offline caching)
(global as any).BroadcastChannel = class {
  constructor(name: string) {}
  postMessage() {}
  close() {}
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
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Board from "@/components/Board";
import mockBoardData from "@/__mocks__/mockBoard";

// ==============================
// MSW Handlers
// ==============================
const server = setupServer(
  http.get("/api/boards/1", () => HttpResponse.json(mockBoardData)),
  http.post("/api/tasks", async ({ request }) => {
    const body = (await request.json()) as { title: string; [key: string]: any };
    return HttpResponse.json({ ...body, id: Date.now() });
  })
);

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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// ==============================
// Tests
// ==============================
test("BoardPage displays tasks", async () => {
  render(<Board boardId={1} />, { wrapper: createWrapper() });

  // Wait for the first task to appear
  const task1 = await screen.findByText("Task 1");
  expect(task1).toBeInTheDocument();
});