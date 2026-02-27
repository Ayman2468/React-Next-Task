import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BoardsPage from "./pages/boards/BoardsPage";
import BoardDetailsPage from "./pages/boards/[id]";
import ProtectedRoute from "./routes/ProtectedRoute";
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Login, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/boards", element: _jsx(ProtectedRoute, { children: _jsx(BoardsPage, {}) }) }), _jsx(Route, { path: "/boards/:id", element: _jsx(ProtectedRoute, { children: _jsx(BoardDetailsPage, {}) }) })] }));
}
