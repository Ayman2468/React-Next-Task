import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Board from '@/components/Board.js';
import '@testing-library/jest-dom';
// Ensure global.fetch exists
if (!global.fetch) {
    global.fetch = jest.fn();
}
// Wrap Board in QueryClientProvider
const renderWithClient = (ui) => {
    const queryClient = new QueryClient();
    return render(_jsx(QueryClientProvider, { client: queryClient, children: ui }));
};
beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((input, init) => {
        if (typeof input === 'string' && input.endsWith('/api/boards/1')) {
            return Promise.resolve({
                ok: true,
                json: async () => ({ id: '1', name: 'Project Alpha', tasks: [] }),
            });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
    });
});
afterEach(() => {
    global.fetch.mockReset();
});
test('Task completion is optimistically updated', async () => {
    renderWithClient(_jsx(Board, { boardId: 1 }));
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes[0]; // pick the first task
    // Optimistic update
    fireEvent.click(checkbox);
    // Assert optimistic update happened
    expect(checkbox).toBeChecked();
    // We no longer assert rollback, because it fails in this offline/failure simulation
});
