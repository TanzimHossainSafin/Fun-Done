import { Request, Response } from "express";
import Joke from "../models/createJokes.model";
export const getFunJoke = async (req: Request, res: Response) => {
    //const id = req.params.id;
    const jokes = await Joke.find().lean();
    if (!jokes) {
        return res.status(404).json({ message: "Joke not found" });
    }
    // Convert ObjectId to string for userId
    const jokesWithStringIds = jokes.map(joke => ({
        ...joke,
        userId: joke.userId ? String(joke.userId) : null,
        _id: String(joke._id)
    }));
    res.json({ message: "joke", joke: jokesWithStringIds });
};