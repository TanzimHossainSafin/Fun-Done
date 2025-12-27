import router from "express";
import { getFunJoke } from "../controller/getFunJoke";
import { createFunJoke } from "../controller/createFunJoke";
export const funRouter = router();

//get all jokes 
funRouter.get("/jokes", getFunJoke);


//create a new joke
funRouter.post("/addjokes", createFunJoke);
