import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    requiredPermission,
}) => {
    const { token, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If a permission is required, check if user has it
    if (requiredPermission && user) {
        console.log(
            `[ProtectedRoute] Checking permission: ${requiredPermission}`,
        );
        console.log("[ProtectedRoute] User permissions:", user.permissions);

        if (
            !user.permissions ||
            !user.permissions.includes(requiredPermission)
        ) {
            console.warn(
                `[ProtectedRoute] Access Denied. User missing: ${requiredPermission}`,
            );
            // User is logged in but doesn't have the specific permission
            // Redirect to dashboard or show unauthorized
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
