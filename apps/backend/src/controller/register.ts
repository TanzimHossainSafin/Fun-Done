import {Request,Response} from "express";
import User from "../models/user.model";
import { registerSchema } from "../utils/validation";
import {hashPassword} from "../utils/hashingPassword";
export const register=async(req:Request,res:Response)=>{
    const data=req.body;
    //zod schema validation 
    const validationResult=registerSchema.safeParse(data);
    try{
     if(!validationResult.success){
        res.status(400).json({ message: "Bad Request Please make sure your data format is correct" });
        return;
     };
     const { username, email, password } = validationResult.data;

     //check if the user already exists
     const existingUser=await User.findOne({email});
     if(existingUser){
        res.status(400).json({message:"User already exists! Please try with different email"});
        return;
     }
     const signup=await User.create({
            username:username,
            email:email,
            password:await hashPassword(password)
     });
     if(!signup){
            res.status(500).json({message:"Internal Server Errors"})
        }
        res.status(201).json({message:"User registered successfully", user:signup});
     }catch(err){
       console.log("Registration Error",err);
     }
}