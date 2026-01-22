import {Request,Response} from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { registerSchema } from "../utils/validation";
import {hashPassword} from "../utils/hashingPassword";
import cloudinary from "../utils/cloudinary";

// Generate default avatar URL using UI Avatars
const generateDefaultAvatar = (username: string): string => {
    const initial = username.charAt(0).toUpperCase();
    // Using UI Avatars API to generate avatar with initial
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=3b82f6&color=fff&size=200&bold=true`;
};

export const register=async(req:Request,res:Response)=>{
    const data=req.body;
    //zod schema validation 
    const validationResult=registerSchema.safeParse(data);
    try{
     if(!validationResult.success){
        res.status(400).json({ message: "Bad Request Please make sure your data format is correct" });
        return;
     };
     const { username, email, password, profileImage } = validationResult.data;

     //check if the user already exists
     const existingUser=await User.findOne({email});
     if(existingUser){
        res.status(400).json({message:"User already exists! Please try with different email"});
        return;
     }

     let profileImageUrl = generateDefaultAvatar(username);

     // Upload image to Cloudinary if provided
     if (profileImage && profileImage.startsWith('data:')) {
         try {
             const uploadResult = await cloudinary.uploader.upload(profileImage, {
                 folder: 'udyomix/profiles',
                 resource_type: 'auto',
                 transformation: [
                     { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                     { quality: 'auto' }
                 ]
             });
             profileImageUrl = uploadResult.secure_url;
         } catch (uploadError) {
             console.error('Cloudinary upload error:', uploadError);
             // If upload fails, use default avatar
             profileImageUrl = generateDefaultAvatar(username);
         }
     }

     const signup=await User.create({
            username:username,
            email:email,
            password:await hashPassword(password),
            profileImage: profileImageUrl
     });
     if(!signup){
            res.status(500).json({message:"Internal Server Errors"})
            return;
        }

        // Generate JWT token for auto-login
        const secret = process.env.JWT_SECRET || "dev_jwt_secret";
        const token = jwt.sign(
            {
                userId: signup._id,
                email: signup.email,
            },
            secret,
            { expiresIn: "7d" }
        );

        // Set httpOnly cookie (secure and httpOnly for XSS protection)
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("udyomix_token", token, {
            httpOnly: true,
            secure: isProduction, // Only send over HTTPS in production
            sameSite: "lax", // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
        });

        res.status(201).json({
            message:"User registered successfully", 
            user: {
                id: signup._id.toString(),
                username: signup.username,
                email: signup.email,
                profileImage: signup.profileImage
            }
        });
     }catch(err){
       console.log("Registration Error",err);
       res.status(500).json({message:"Internal Server Error"});
     }
}