import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { funRouter } from "./router/jokeRouter";
import { userRouter } from "./router/userRouter";
import { studyRouter } from "./router/studyRouter";
import careerRouter from "./router/careerRouter";
import interviewRouter from "./router/interviewRouter";
import getDBInstance from "./utils/db";
import { initializeSocket } from "./services/socketService";
dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5175"],
    credentials: true
}));

//api routers 
app.use('/app/v1/funs', funRouter);
app.use('/app/v1/users', userRouter);
app.use('/app/v1/study', studyRouter);
app.use('/app/v1/career', careerRouter);
app.use('/app/v1/interview', interviewRouter);
// mongodb connection instance
getDBInstance();

// Create HTTP server and initialize Socket.IO
const httpServer = createServer(app);
initializeSocket(httpServer);

//server instance connection
const listen=() => {
  httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Socket.IO server initialized`);
});
}
listen();