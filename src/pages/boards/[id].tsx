import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { DropResult } from "@hello-pangea/dnd";
import { DragDropContext } from "@hello-pangea/dnd";
import { useBoard } from "../../hooks/useBoard.js";
import Column from "../../components/Column.js";
import TaskModal from "../../components/TaskModal.js";
import Skeleton from "../../components/Skeleton.js";
import type { Task } from "../../types/index.js";
import { useQueryClient } from "@tanstack/react-query";

export default function BoardDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const boardId = id ? Number(id) : 0;

  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

    const {
    data: board,
    isLoading,
    updateTask,
    createTask,
    deleteTask,
    isOffline,
    syncing,
    syncFailed,
  } = useBoard(boardId);

  if (!boardId || isLoading || !board) {
    return (
      <div className="p-6 flex gap-4 overflow-x-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-64 h-96 rounded" />
        ))}
      </div>
    );
  }

  // ---------------- Filters ----------------
  const statusParam = searchParams.get("status");
  const priorityParam = searchParams.get("priority");
  const searchParam = searchParams.get("search")?.toLowerCase() || "";

  const filteredBoard = {
    ...board,
    columns: board.columns.map(col => ({
      ...col,
      taskIds: col.taskIds.filter(taskId => {
        const task = board.tasks.find(t => t.id === taskId);
        if (!task) return false;

        // Filter by status (columnId)
        if (statusParam && statusParam !== "all" && task.columnId !== Number(statusParam))
          return false;

        // Filter by priority
        if (priorityParam && priorityParam !== "all" && task.priority !== priorityParam)
          return false;

        // Filter by search text
        if (searchParam && !task.title.toLowerCase().includes(searchParam)) return false;

        return true;
      }),
    })),
  };

  const openNewTaskModal = (columnId: number) => {
    setModalTask({
      id: 0,
      title: "",
      description: "",
      priority: "low",
      columnId,
      order: 0,
      tags: [],
      dueDate: new Date().toISOString(),
      assignee: "",
    });
  };

  // ---------------- Drag & Drop ----------------
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || !board) return;

    const taskId = parseInt(draggableId);

    // Deep copy board
    const newBoard = {
      ...board,
      columns: board.columns.map(col => ({ ...col, taskIds: [...col.taskIds] })),
    };

    const sourceCol = newBoard.columns.find(c => c.id.toString() === source.droppableId);
    const destCol = newBoard.columns.find(c => c.id.toString() === destination.droppableId);
    if (!sourceCol || !destCol) return;

    // Remove from source and insert into destination
    const [movedTaskId] = sourceCol.taskIds.splice(source.index, 1);
    destCol.taskIds.splice(destination.index, 0, movedTaskId);

    // Update task's columnId
    const task = newBoard.tasks.find(t => t.id === taskId);
    if (task) task.columnId = destCol.id;

    // Optimistic UI update
    queryClient.setQueryData(["board", boardId], newBoard);

    // Rollback on error
    updateTask.mutate(
      { taskId, data: { columnId: destCol.id } },
      {
        onError: () => queryClient.setQueryData(["board", boardId], board),
      }
    );
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      {isOffline && (
  <div className="bg-yellow-100 text-yellow-800 p-2 rounded">Offline Mode</div>
)}
{syncing && (
  <div className="bg-blue-100 text-blue-800 p-2 rounded">Syncing...</div>
)}
{syncFailed && (
  <div className="bg-red-100 text-red-800 p-2 rounded">Sync Failed</div>
)}
      <h1 className="text-2xl font-bold mb-4">{board.name}</h1>

      {/* ---------------- Filters UI ---------------- */}
      <div className="flex gap-2 mb-4">
        <select
          value={statusParam || "all"}
          onChange={e => {
            const params = new URLSearchParams(searchParams);
            if (e.target.value === "all") params.delete("status");
            else params.set("status", e.target.value);
            setSearchParams(params);
          }}
        >
          <option value="all">All</option>
          {board.columns.map(col => (
            <option key={col.id} value={col.id}>{col.name}</option>
          ))}
        </select>

        <select
          value={priorityParam || "all"}
          onChange={e => {
            const params = new URLSearchParams(searchParams);
            if (e.target.value === "all") params.delete("priority");
            else params.set("priority", e.target.value);
            setSearchParams(params);
          }}
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={searchParams.get("search") || ""}
          onChange={e => {
            const params = new URLSearchParams(searchParams);
            if (!e.target.value) params.delete("search");
            else params.set("search", e.target.value);
            setSearchParams(params);
          }}
        />
      </div>

      {/* ---------------- Columns ---------------- */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto">
          {filteredBoard.columns.map(col => (
            <Column
              key={col.id}
              board={filteredBoard}
              column={col}
              openTaskModal={setModalTask}
              openNewTaskModal={openNewTaskModal}
              deleteTask={(taskId) => deleteTask.mutate(taskId)}
            />
          ))}
        </div>
      </DragDropContext>

      {/* ---------------- Activity Log ---------------- */}
      <div className="mt-6 bg-gray-50 p-3 rounded">
        <h3 className="font-bold mb-2">Activity Log</h3>
        {board.activities.map(activity => (
          <div key={activity.id} className="text-sm mb-1">
            <span className="text-gray-500 mr-2">
              {new Date(activity.createdAt).toLocaleTimeString()}
            </span>
            {activity.message}
          </div>
        ))}
      </div>

      {/* ---------------- Task Modal ---------------- */}
      {modalTask && (
        <TaskModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onSubmit={(data) => {
            if (!data.title) return;

            if (modalTask.id) {
              updateTask.mutate({ taskId: modalTask.id, data });
            } else {
              createTask.mutate({
                ...data,
                title: data.title!,
                columnId: modalTask.columnId!,
                order: modalTask.order ?? 0,
                priority: data.priority ?? "low",
                tags: data.tags ?? [],
                dueDate: data.dueDate ?? new Date().toISOString(),
                assignee: data.assignee ?? "",
              });
            }

            setModalTask(null);
          }}
        />
      )}
    </div>
  );
}