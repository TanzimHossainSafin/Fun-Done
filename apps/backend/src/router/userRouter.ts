import router from "express";
export const userRouter =router();
import { register } from "../controller/register";
import { login } from "../controller/login";
import { searchUsers } from "../controller/searchUsers";
import { chat } from "../controller/chat";


//user Register 
userRouter.post('/register',register);

//user Login 
userRouter.post('/login',login)

// search users by username
userRouter.get('/search', searchUsers);

// chat endpoint using Gemini API
userRouter.post('/chat', chat);