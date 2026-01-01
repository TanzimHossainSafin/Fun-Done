import router from "express";
import { joinServer } from "../controller/joinServer";
import {createServer} from "../controller/createserver";

export const jokeContestServerRouter = router();


//join a existing joke contest server 
jokeContestServerRouter.post("/join",joinServer);

//create own joke contest server 
jokeContestServerRouter.post("/createserver",createServer);

