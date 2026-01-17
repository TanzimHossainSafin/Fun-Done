import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { comparePassword } from "../utils/hashingPassword";
import { loginSchema } from "../utils/validation";

export const login = async (req: Request, res: Response) => {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Bad Request Please make sure your data format is correct",
            errors: validationResult.error.flatten(),
        });
    }

    const { email, password } = validationResult.data;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "dev_jwt_secret";

    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email,
        },
        secret,
        { expiresIn: "7d" }
    );

    return res.status(200).json({
        message: "Login successful",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });
};