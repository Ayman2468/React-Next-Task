import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
export default function BoardFormModal({ defaultValues, onSubmit, onClose }) {
    const { register, handleSubmit } = useForm({ defaultValues });
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "bg-white p-6 rounded-xl w-80 space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: defaultValues ? "Edit Board" : "Add Board" }), _jsx("input", { ...register("name"), placeholder: "Board Name", className: "w-full border p-2 rounded" }), _jsx("input", { ...register("description"), placeholder: "Description", className: "w-full border p-2 rounded" }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 bg-gray-300 rounded", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded", children: defaultValues ? "Update" : "Add" })] })] }) }));
}
