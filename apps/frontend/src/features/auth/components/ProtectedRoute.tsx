import type React from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/authStorage";

type ProtectedRouteProps = {
    children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const user = getUser();
    // Token is stored in httpOnly cookie, so we check if user data exists
    // The cookie will be validated by the backend on each request
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};
