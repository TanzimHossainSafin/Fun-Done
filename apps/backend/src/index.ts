import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { funRouter } from "./router/jokeRouter";
import { userRouter } from "./router/userRouter";
import getDBInstance from "./utils/db";
dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}));

//api routers 
app.use('/app/v1/funs', funRouter);
app.use('/app/v1/users', userRouter);
// mongodb connection instance
getDBInstance();

//server instance connection
const listen=() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
}
listen();