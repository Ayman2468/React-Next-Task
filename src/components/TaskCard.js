import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Draggable } from "@hello-pangea/dnd";
export default function TaskCard({ task, index, openTaskModal }) {
    return (_jsx(Draggable, { draggableId: task.id.toString(), index: index, children: provided => (_jsxs("div", { ref: provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, onClick: () => openTaskModal(task), className: "bg-white p-2 rounded shadow cursor-pointer", children: [_jsx("p", { className: "font-bold", children: task.title }), task.description && _jsx("p", { className: "text-sm text-gray-500", children: task.description })] })) }));
}
