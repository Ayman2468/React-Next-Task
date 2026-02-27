import { jsx as _jsx } from "react/jsx-runtime";
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/react'; // <-- import waitFor separately
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBoard } from '@/hooks/useBoard';
const queryClient = new QueryClient();
const wrapper = ({ children }) => (_jsx(QueryClientProvider, { client: queryClient, children: children }));
test('useBoard returns board data', async () => {
    const { result } = renderHook(() => useBoard(1), { wrapper });
    // waitFor is imported separately
    await waitFor(() => expect(result.current.board).toBeDefined());
});
