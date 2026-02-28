import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { useBoard } from "../../hooks/useBoard.js";
import Column from "../../components/Column.js";
import TaskModal from "../../components/TaskModal.js";
import Skeleton from "../../components/Skeleton.js";
import { useQueryClient } from "@tanstack/react-query";
export default function BoardDetailsPage() {
    const { id } = useParams();
    const boardId = id ? Number(id) : 0;
    const [modalTask, setModalTask] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { data: board, isLoading, updateTask, createTask, deleteTask, isOffline, syncing, syncFailed, } = useBoard(boardId);
    if (!boardId || isLoading || !board) {
        return (_jsx("div", { className: "p-6 flex gap-4 overflow-x-auto", children: Array.from({ length: 3 }).map((_, i) => (_jsx(Skeleton, { className: "w-64 h-96 rounded" }, i))) }));
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
                if (!task)
                    return false;
                // Filter by status (columnId)
                if (statusParam && statusParam !== "all" && task.columnId !== Number(statusParam))
                    return false;
                // Filter by priority
                if (priorityParam && priorityParam !== "all" && task.priority !== priorityParam)
                    return false;
                // Filter by search text
                if (searchParam && !task.title.toLowerCase().includes(searchParam))
                    return false;
                return true;
            }),
        })),
    };
    const openNewTaskModal = (columnId) => {
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
    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination || !board)
            return;
        const taskId = parseInt(draggableId);
        // Deep copy board
        const newBoard = {
            ...board,
            columns: board.columns.map(col => ({ ...col, taskIds: [...col.taskIds] })),
        };
        const sourceCol = newBoard.columns.find(c => c.id.toString() === source.droppableId);
        const destCol = newBoard.columns.find(c => c.id.toString() === destination.droppableId);
        if (!sourceCol || !destCol)
            return;
        // Remove from source and insert into destination
        const [movedTaskId] = sourceCol.taskIds.splice(source.index, 1);
        destCol.taskIds.splice(destination.index, 0, movedTaskId);
        // Update task's columnId
        const task = newBoard.tasks.find(t => t.id === taskId);
        if (task)
            task.columnId = destCol.id;
        // Optimistic UI update
        queryClient.setQueryData(["board", boardId], newBoard);
        // Rollback on error
        updateTask.mutate({ taskId, data: { columnId: destCol.id } }, {
            onError: () => queryClient.setQueryData(["board", boardId], board),
        });
    };
    return (_jsxs("div", { className: "p-6 flex flex-col gap-4", children: [isOffline && (_jsx("div", { className: "bg-yellow-100 text-yellow-800 p-2 rounded", children: "Offline Mode" })), syncing && (_jsx("div", { className: "bg-blue-100 text-blue-800 p-2 rounded", children: "Syncing..." })), syncFailed && (_jsx("div", { className: "bg-red-100 text-red-800 p-2 rounded", children: "Sync Failed" })), _jsx("h1", { className: "text-2xl font-bold mb-4", children: board.name }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsxs("select", { value: statusParam || "all", onChange: e => {
                            const params = new URLSearchParams(searchParams);
                            if (e.target.value === "all")
                                params.delete("status");
                            else
                                params.set("status", e.target.value);
                            setSearchParams(params);
                        }, children: [_jsx("option", { value: "all", children: "All" }), board.columns.map(col => (_jsx("option", { value: col.id, children: col.name }, col.id)))] }), _jsxs("select", { value: priorityParam || "all", onChange: e => {
                            const params = new URLSearchParams(searchParams);
                            if (e.target.value === "all")
                                params.delete("priority");
                            else
                                params.set("priority", e.target.value);
                            setSearchParams(params);
                        }, children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] }), _jsx("input", { type: "text", placeholder: "Search...", value: searchParams.get("search") || "", onChange: e => {
                            const params = new URLSearchParams(searchParams);
                            if (!e.target.value)
                                params.delete("search");
                            else
                                params.set("search", e.target.value);
                            setSearchParams(params);
                        } })] }), _jsx(DragDropContext, { onDragEnd: handleDragEnd, children: _jsx("div", { className: "flex gap-4 overflow-x-auto", children: filteredBoard.columns.map(col => (_jsx(Column, { board: filteredBoard, column: col, openTaskModal: setModalTask, openNewTaskModal: openNewTaskModal, deleteTask: (taskId) => deleteTask.mutate(taskId) }, col.id))) }) }), _jsxs("div", { className: "mt-6 bg-gray-50 p-3 rounded", children: [_jsx("h3", { className: "font-bold mb-2", children: "Activity Log" }), board.activities.map(activity => (_jsxs("div", { className: "text-sm mb-1", children: [_jsx("span", { className: "text-gray-500 mr-2", children: new Date(activity.createdAt).toLocaleTimeString() }), activity.message] }, activity.id)))] }), modalTask && (_jsx(TaskModal, { task: modalTask, onClose: () => setModalTask(null), onSubmit: (data) => {
                    if (!data.title)
                        return;
                    if (modalTask.id) {
                        updateTask.mutate({ taskId: modalTask.id, data });
                    }
                    else {
                        createTask.mutate({
                            ...data,
                            title: data.title,
                            columnId: modalTask.columnId,
                            order: modalTask.order ?? 0,
                            priority: data.priority ?? "low",
                            tags: data.tags ?? [],
                            dueDate: data.dueDate ?? new Date().toISOString(),
                            assignee: data.assignee ?? "",
                        });
                    }
                    setModalTask(null);
                } }))] }));
}
