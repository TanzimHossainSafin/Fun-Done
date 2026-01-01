import { Request, Response } from "express";
import Joke from "../models/createJokes.model";
export const getFunJoke = async (req: Request, res: Response) => {
    //const id = req.params.id;
    const joke = await Joke.find();
    if (!joke) {
        return res.status(404).json({ message: "Joke not found" });
    };
    res.json({ message: "joke", joke });
};