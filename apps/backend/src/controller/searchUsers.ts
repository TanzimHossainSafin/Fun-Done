import { Request, Response } from "express";
import User from "../models/user.model";

export const searchUsers = async (req: Request, res: Response) => {
    const { query } = req.query;
    const search = String(query || "").trim();
    if (!search) {
        return res.status(200).json({ users: [] });
    }

    const users = await User.find({
        username: { $regex: search, $options: "i" },
    })
        .limit(10)
        .select("_id username email");

    return res.status(200).json({
        users: users.map((user) => ({
            id: user._id,
            username: user.username,
            email: user.email,
        })),
    });
};
