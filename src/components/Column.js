import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Droppable, Draggable } from "@hello-pangea/dnd";
export default function Column({ board, column, openTaskModal, openNewTaskModal, deleteTask, }) {
    const tasks = column.taskIds
        .map(id => board.tasks.find(t => t.id === id))
        .filter((t) => t !== undefined);
    return (_jsxs("div", { className: "w-64 bg-gray-100 rounded p-2 shrink-0", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h2", { className: "font-bold", children: column.name }), openNewTaskModal && (_jsx("button", { onClick: () => openNewTaskModal(column.id), className: "text-sm px-2 py-1 bg-green-500 text-white rounded", children: "+ Add Task" }))] }), _jsx(Droppable, { droppableId: column.id.toString(), children: (provided, snapshot) => (_jsxs("div", { ref: provided.innerRef, ...provided.droppableProps, className: `min-h-50 p-1 rounded ${snapshot.isDraggingOver ? "bg-blue-100" : ""}`, children: [tasks.map((task, index) => (_jsx(Draggable, { draggableId: task.id.toString(), index: index, children: (provided, snapshot) => (_jsxs("div", { ref: provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, className: `p-2 mb-2 rounded shadow border bg-white relative ${snapshot.isDragging ? "bg-blue-200" : ""}`, children: [_jsx("h3", { className: "font-semibold", children: task.title }), task.description && (_jsx("p", { style: { fontSize: 12 }, children: task.description })), task.priority && (_jsx("span", { className: `text-xs px-1 rounded ${task.priority === "high"
                                            ? "bg-red-400 text-white"
                                            : task.priority === "medium"
                                                ? "bg-yellow-300"
                                                : "bg-green-300"}`, children: task.priority })), deleteTask && (_jsx("button", { onClick: e => {
                                            e.stopPropagation();
                                            deleteTask(task.id);
                                        }, className: "absolute z-10 top-1 right-1 text-white bg-red-600 text-sm hover:bg-red-800 p-1 rounded-sm", children: "Delete" })), _jsx("div", { onClick: () => openTaskModal(task), className: "absolute inset-0" })] })) }, task.id))), provided.placeholder] })) })] }));
}
