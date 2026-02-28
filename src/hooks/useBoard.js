import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/boards.js";
import { useState, useEffect } from "react";

const STORAGE_KEY = "kanban_boards";

export const useBoard = (boardId) => {
  const queryClient = useQueryClient();
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncFailed, setSyncFailed] = useState(false);

  // Online/offline listeners
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const saveBoardToLocalStorage = (updatedBoard) => {
    const allBoards = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const idx = allBoards.findIndex(b => b.id === updatedBoard.id);
    if (idx > -1) allBoards[idx] = updatedBoard;
    else allBoards.push(updatedBoard);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allBoards));
  };

  // Main board query
  const query = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => api.getBoard(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 0.1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  // Sync offline queue
  useEffect(() => {
    if (!offlineQueue.length || isOffline || syncing) return;

    const syncQueue = async () => {
      setSyncing(true);
      setSyncFailed(false);
      try {
        const results = await Promise.all(
          offlineQueue.map(op => {
            if (op.type === "create") return api.createTask(boardId, op.data);
            if (op.type === "update" && op.taskId) return api.updateTask(boardId, op.taskId, op.data);
            return Promise.resolve();
          })
        );
        const failed = results.some(r => r instanceof Error);
        if (!failed) setOfflineQueue([]);
        else setSyncFailed(true);
      } finally {
        setSyncing(false);
      }
    };

    syncQueue();
  }, [offlineQueue, isOffline, boardId, syncing]);

  // ------------------- Task mutations -------------------
  const createTask = useMutation({
    mutationFn: (data) => {
      if (isOffline) {
        setOfflineQueue(q => [...q, { type: "create", data }]);
        return Promise.resolve({ ...data, id: Date.now() });
      }
      return api.createTask(boardId, data);
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData(["board", boardId], oldBoard => {
        if (!oldBoard) return undefined;
        const newTasks = oldBoard.tasks.some(t => t.id === newTask.id)
          ? oldBoard.tasks
          : [...oldBoard.tasks, newTask];
        const newColumns = oldBoard.columns.map(col =>
          col.id === newTask.columnId
            ? { ...col, taskIds: col.taskIds.includes(newTask.id) ? col.taskIds : [...col.taskIds, newTask.id] }
            : col
        );
        const newActivities = [
          ...(oldBoard.activities || []),
          { id: Date.now(), message: `Task "${newTask.title}" created`, createdAt: new Date().toISOString() },
        ];
        const updatedBoard = { ...oldBoard, tasks: newTasks, columns: newColumns, activities: newActivities };
        saveBoardToLocalStorage(updatedBoard);
        return updatedBoard;
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, data }) => {
      if (isOffline) {
        setOfflineQueue(q => [...q, { type: "update", taskId, data }]);
        return Promise.reject(new Error("Offline - queued"));
      }
      return api.updateTask(boardId, taskId, data);
    },
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["board", boardId] });
      const previousBoard = queryClient.getQueryData(["board", boardId]);

      if (previousBoard) {
        queryClient.setQueryData(["board", boardId], oldBoard => {
          if (!oldBoard) return oldBoard;
          const newTasks = oldBoard.tasks.map(t => t.id === taskId ? { ...t, ...data } : t);
          const task = oldBoard.tasks.find(t => t.id === taskId);
          const newActivities = task
            ? [...(oldBoard.activities || []), { id: Date.now(), message: `Task "${task.title}" updated`, createdAt: new Date().toISOString() }]
            : oldBoard.activities || [];
          const updatedBoard = { ...oldBoard, tasks: newTasks, activities: newActivities };
          saveBoardToLocalStorage(updatedBoard);
          return updatedBoard;
        });
      }

      return { previousBoard };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(["board", boardId], context.previousBoard);
        saveBoardToLocalStorage(context.previousBoard);
      }
    },
  });

  const deleteTask = useMutation({
    mutationFn: (taskId) => api.deleteTask(boardId, taskId),
    onSuccess: (_void, taskId) => {
      queryClient.setQueryData(["board", boardId], oldBoard => {
        if (!oldBoard) return undefined;
        const deletedTask = oldBoard.tasks.find(t => t.id === taskId);
        const newTasks = oldBoard.tasks.filter(t => t.id !== taskId);
        const newColumns = oldBoard.columns.map(col => ({
          ...col,
          taskIds: col.taskIds.filter(id => id !== taskId),
        }));
        const newActivities = deletedTask
          ? [...(oldBoard.activities || []), { id: Date.now(), message: `Task "${deletedTask.title}" deleted`, createdAt: new Date().toISOString() }]
          : oldBoard.activities;
        const updatedBoard = { ...oldBoard, tasks: newTasks, columns: newColumns, activities: newActivities };
        saveBoardToLocalStorage(updatedBoard);
        return updatedBoard;
      });
    },
  });

  const addActivity = useMutation({
    mutationFn: (message) => api.addActivity(boardId, message),
    onSuccess: newActivity => {
      queryClient.setQueryData(["board", boardId], oldBoard => {
        if (!oldBoard) return undefined;
        const updatedBoard = { ...oldBoard, activities: [...(oldBoard.activities || []), newActivity] };
        saveBoardToLocalStorage(updatedBoard);
        return updatedBoard;
      });
    },
  });

  // ------------------- Drag & Drop -------------------
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || !query.data) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const board = query.data;
    const taskId = Number(draggableId);
    const task = board.tasks.find(t => t.id === taskId);
    if (!task) return;
    const previousBoard = { ...board };

    if (isOffline) {
      setOfflineQueue(q => [
        ...q,
        { type: "update", taskId, data: { columnId: Number(destination.droppableId), order: destination.index } }
      ]);
      return;
    }

    queryClient.setQueryData(["board", boardId], oldBoard => {
      if (!oldBoard) return undefined;
      const newColumns = oldBoard.columns.map(col => {
        if (col.id.toString() === source.droppableId)
          return { ...col, taskIds: col.taskIds.filter(id => id !== taskId) };
        if (col.id.toString() === destination.droppableId) {
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(destination.index, 0, taskId);
          return { ...col, taskIds: newTaskIds };
        }
        return col;
      });
      const newTasks = oldBoard.tasks.map(t =>
        t.id === taskId ? { ...t, columnId: Number(destination.droppableId) } : t
      );
      const newActivities = [
        ...(oldBoard.activities || []),
        { id: Date.now(), message: `Task "${task.title}" moved from column ${source.droppableId} to ${destination.droppableId}`, createdAt: new Date().toISOString() },
      ];
      const updatedBoard = { ...oldBoard, columns: newColumns, tasks: newTasks, activities: newActivities };
      saveBoardToLocalStorage(updatedBoard);
      return updatedBoard;
    });

    api.updateTask(boardId, taskId, { columnId: Number(destination.droppableId), order: destination.index })
      .catch(() => {
        queryClient.setQueryData(["board", boardId], previousBoard);
        saveBoardToLocalStorage(previousBoard);
        alert("Failed to move task. Changes rolled back.");
      });
  };

  return {
    board: query.data,
    ...query,
    createTask,
    updateTask,
    deleteTask,
    addActivity,
    handleDragEnd,
    offlineQueue,
    isOffline,
    syncing,
    syncFailed,
  };
};