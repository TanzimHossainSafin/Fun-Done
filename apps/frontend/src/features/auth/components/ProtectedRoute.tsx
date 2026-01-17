import type React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../utils/authStorage";

type ProtectedRouteProps = {
    children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const token = getToken();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};
