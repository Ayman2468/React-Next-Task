import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BoardsPage from "./pages/boards/BoardsPage";
import BoardDetailsPage from "./pages/boards/[id]";
import ProtectedRoute from "./routes/ProtectedRoute";

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