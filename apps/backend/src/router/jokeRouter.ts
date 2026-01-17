import router from "express";
import { getFunJoke } from "../controller/getjoke";
import { createFunJoke } from "../controller/createFunJoke";
import { updateFunJoke } from "../controller/updateFunJoke";
import { deleteFunJoke } from "../controller/deleteFunJoke";
export const funRouter = router();

//get all jokes 
funRouter.get("/jokes", getFunJoke);


//create a new joke
funRouter.post("/addjokes", createFunJoke);

//update a joke
funRouter.put("/jokes/:id", updateFunJoke);

//delete a joke
funRouter.delete("/jokes/:id", deleteFunJoke);
