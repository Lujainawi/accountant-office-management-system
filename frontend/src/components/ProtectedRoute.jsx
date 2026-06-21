import { Navigate, Outlet, useLocation } from "react-router";
import LoadingState from "./LoadingState";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    const from = location.pathname;
    const loginPath =
      from && from.startsWith("/") && !from.startsWith("//")
        ? `/login?from=${encodeURIComponent(from)}`
        : "/login";

    return <Navigate to={loginPath} replace />;
  }

  return <Outlet />;
}
