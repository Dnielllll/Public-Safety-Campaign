import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.jsx";

/**
 * Wrap routes that require authentication and (optionally) a specific role.
 * roles: array of allowed roles, e.g. ["admin"] or ["admin", "staff"]
 */
export default function RequireRole({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has valid role
  if (!user.role) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user has required role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
