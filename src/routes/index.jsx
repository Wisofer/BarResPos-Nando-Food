import { createHashRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";
import { AuthHome } from "../pages/AuthHome.jsx";
import { Login } from "../pages/Login.jsx";
import { NotFound } from "../pages/NotFound.jsx";
import { RouteErrorFallback } from "../components/ErrorBoundary.jsx";

export const router = createHashRouter([
  { path: "/login", element: <Login />, errorElement: <RouteErrorFallback /> },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AuthHome />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorFallback />,
  },
  { path: "/", element: <Navigate to="/login" replace />, errorElement: <RouteErrorFallback /> },
  { path: "*", element: <NotFound />, errorElement: <RouteErrorFallback /> },
]);
