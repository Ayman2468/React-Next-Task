import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.js";
import Dashboard from "./pages/Dashboard.js";
import BoardsPage from "./pages/boards/BoardsPage.js";
import BoardDetailsPage from "./pages/boards/[id].js";
import ProtectedRoute from "./routes/ProtectedRoute.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/boards" element={<ProtectedRoute><BoardsPage /></ProtectedRoute>} />
      <Route path="/boards/:id" element={<ProtectedRoute><BoardDetailsPage /></ProtectedRoute>} />
    </Routes>
  );
}