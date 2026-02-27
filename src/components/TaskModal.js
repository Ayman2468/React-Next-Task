import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function TaskModal({ task, onClose, onSubmit, currentUser, }) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [priority, setPriority] = useState(task.priority || "low");
    const [dueDate, setDueDate] = useState(task.dueDate || "");
    const [assignee, setAssignee] = useState(task.assignee || "");
    //for test only      const isOwner = task.ownerId === currentUser.id;
    const isOwner = 1;
    return (_jsx("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white p-4 rounded w-96", children: [_jsx("h2", { className: "text-lg font-bold mb-2", children: task.id ? "Edit Task" : "New Task" }), _jsx("input", { type: "text", className: "border p-2 w-full mb-2", value: title, onChange: e => setTitle(e.target.value), placeholder: "Title", disabled: !isOwner }), _jsx("textarea", { className: "border p-2 w-full mb-2", value: description, onChange: e => setDescription(e.target.value), placeholder: "Description", disabled: !isOwner }), _jsxs("label", { className: "block mb-2", children: ["Priority:", _jsxs("select", { className: "border p-2 w-full mt-1", value: priority, onChange: e => setPriority(e.target.value), disabled: !isOwner, children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] })] }), _jsxs("label", { className: "block mb-2", children: ["Due Date:", _jsx("input", { type: "date", className: "border p-2 w-full mt-1", value: dueDate, onChange: e => setDueDate(e.target.value), disabled: !isOwner })] }), _jsx("input", { type: "text", className: "border p-2 w-full mb-2", value: assignee, onChange: e => setAssignee(e.target.value), placeholder: "Assignee", disabled: !isOwner }), _jsxs("div", { className: "flex justify-end gap-2 mt-2", children: [_jsx("button", { className: "px-4 py-2 bg-gray-300 rounded", onClick: onClose, children: "Cancel" }), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded", onClick: () => onSubmit({ title, description, priority, dueDate, assignee }), disabled: !isOwner, children: "Save" })] })] }) }));
}
