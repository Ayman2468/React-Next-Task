import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../hooks/useAuth";
import { Outlet, useNavigate } from "react-router-dom";
import BoardsPage from "./boards/BoardsPage";
export default function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/");
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Dashboard" }), _jsx(BoardsPage, {}), _jsx(Outlet, {}), _jsx("button", { onClick: handleLogout, className: "bg-red-500 text-white px-4 py-2 rounded", children: "Logout" })] }));
}
