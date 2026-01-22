import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get token from httpOnly cookie
    const token = req.cookies?.udyomix_token;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const secret = process.env.JWT_SECRET || "dev_jwt_secret";
        const decoded = jwt.verify(token, secret) as { userId: string; email: string };
        
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        // Clear invalid cookie
        res.clearCookie("udyomix_token");
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
