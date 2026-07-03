import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";
import LoadingSkeleton from "./LoadingSkeleton";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRole?: "PATIENT" | "DOCTOR" | "ADMIN";
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (allowedRole && user.role !== allowedRole) {
        // Redirect to their respective dashboards if accessing wrong role's dashboard
        if (user.role === "PATIENT") {
          navigate("/patient");
        } else if (user.role === "DOCTOR") {
          navigate("/doctor");
        }
      }
    }
  }, [user, loading, allowedRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <LoadingSkeleton className="h-12 w-64 mb-4" />
        <LoadingSkeleton className="h-6 w-96 mb-2" />
        <LoadingSkeleton className="h-6 w-80" />
      </div>
    );
  }

  if (!user || (allowedRole && user.role !== allowedRole)) {
    return null;
  }

  return <>{children}</>;
};
