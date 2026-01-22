import { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
    try {
        // Clear the httpOnly cookie
        res.clearCookie("udyomix_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Logout failed" });
    }
};
