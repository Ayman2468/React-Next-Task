import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/boards";
export const useBoards = (page, perPage) => {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ["board", page, perPage],
        queryFn: () => api.getBoards(page, perPage),
        staleTime: 1000 * 60 * .1,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
    });
    const create = useMutation({
        mutationFn: (board) => api.createBoard(board),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boards"] });
        },
    });
    const update = useMutation({
        mutationFn: ({ id, data }) => api.updateBoard(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boards"] });
        },
    });
    const remove = useMutation({
        mutationFn: (id) => api.deleteBoard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boards"] });
        },
    });
    return { ...query, create, update, remove };
};
