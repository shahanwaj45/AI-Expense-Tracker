import { useAuth } from "./AuthContext";
import { Redirect } from "wouter";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  // Not logged in → send to login
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (role !== allowedRole) {
    return <Redirect to={`/${role}`} />;
  }

  return <>{children}</>;
}
