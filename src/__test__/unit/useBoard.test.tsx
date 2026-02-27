import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/react'; // <-- import waitFor separately
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBoard } from '@/hooks/useBoard.js';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

test('useBoard returns board data', async () => {
  const { result } = renderHook(() => useBoard(1), { wrapper });

  // waitFor is imported separately
  await waitFor(() => expect(result.current.board).toBeDefined());
});