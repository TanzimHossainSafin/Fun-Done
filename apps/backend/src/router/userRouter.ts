import router from "express";
export const userRouter =router();
import { register } from "../controller/register";
import { login } from "../controller/login";
import { logout } from "../controller/logout";
import { searchUsers } from "../controller/searchUsers";
import { chat } from "../controller/chat";


//user Register 
userRouter.post('/register',register);

//user Login 
userRouter.post('/login',login);

//user Logout
userRouter.post('/logout',logout);

// search users by username
userRouter.get('/search', searchUsers);

// get user by id
userRouter.get('/:userId', async (req, res) => {
    try {
        const User = (await import("../models/user.model")).default;
        const { userId } = req.params;
        const user = await User.findById(userId).select("_id username email");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ message: "Failed to get user", error: error.message });
    }
});

// chat endpoint using Gemini API
userRouter.post('/chat', chat);