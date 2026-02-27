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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <BoardsPage />
      <Outlet />
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}