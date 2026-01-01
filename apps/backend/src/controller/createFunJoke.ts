import { Request, Response } from "express";
import Joke from "../models/createJokes.model";

export const createFunJoke = async (req: Request, res: Response) => {
    const data = req.body;
    if (!data) {
        return res.status(400).json({ message: "Bad Request" });
    };
    const joke = await Joke.create(data);
    return res.status(201).json({ message: "Joke created", joke });
};