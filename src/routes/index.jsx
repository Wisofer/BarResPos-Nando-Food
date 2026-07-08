import { createHashRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";
import { AuthHome } from "../pages/AuthHome.jsx";
import { Login } from "../pages/Login.jsx";
import { NotFound } from "../pages/NotFound.jsx";

export const router = createHashRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AuthHome />
      </ProtectedRoute>
    ),
  },
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <NotFound /> },
]);
