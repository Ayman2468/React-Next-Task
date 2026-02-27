import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/boards.js";
import type { Board, CreateBoardInput } from "../types/index.js";

export const useBoards = (page: number, perPage: number) => {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: Board[]; total: number }, Error>({
      queryKey: ["board", page, perPage],
      queryFn: () => api.getBoards(page, perPage),
      staleTime: 1000 * 60 * .1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    });

  const create = useMutation({
    mutationFn: (board: CreateBoardInput) => api.createBoard(board),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Board> }) =>
      api.updateBoard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  return { ...query, create, update, remove };
};