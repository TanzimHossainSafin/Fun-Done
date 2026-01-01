import { Request, Response } from "express";
import CreateServer from "../models/createServer.model";

export const joinServer=async(req:Request,res:Response)=>{
      const data=req.body.ServerId;
      if(!data){
          return res.status(400).json({message:"Bad Request"});
      };
      const server=await CreateServer.findById(data);
      if(!server){
          return res.status(404).json({message:"Server not found"});
      }
      server.members.push({
        userId: req.body.userId,
        joinedAt: new Date(),
        role: 'member'
      });
      await server.save();
      return res.status(201).json({message:"Join the server",server});
  } ;