import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/auth.schema";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const onSubmit = (data) => {
        login(data);
        navigate("/dashboard");
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-100", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "bg-white p-6 rounded-xl shadow-md w-96 space-y-4", children: [_jsx("h2", { className: "text-2xl font-bold text-center", children: "Login" }), _jsxs("div", { children: [_jsx("input", { ...register("email"), placeholder: "Email", className: "w-full border p-2 rounded" }), errors.email && (_jsx("p", { className: "text-red-500 text-sm", children: errors.email.message }))] }), _jsxs("div", { children: [_jsx("input", { type: "password", ...register("password"), placeholder: "Password", className: "w-full border p-2 rounded" }), errors.password && (_jsx("p", { className: "text-red-500 text-sm", children: errors.password.message }))] }), _jsx("button", { type: "submit", className: "w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700", children: "Login" })] }) }));
}
