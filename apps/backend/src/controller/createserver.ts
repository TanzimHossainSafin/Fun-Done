import { Request, Response } from "express";
import CreateServer from "../models/createServer.model";
export const createServer=async(req:Request,res:Response)=>{
    const data=req.body;
    if(!data){
        return res.status(400).json({message:"Bad Request"});
    };
    const server=await CreateServer.create(data);
    return res.status(201).json({message:"Server created",server});
} 