import router from "express";
export const userRouter =router();
import {register} from "../controller/register";
import { login } from "../controller/login";


//user Register 
userRouter.post('/register',register);

//user Login 
userRouter.post('/login',login)