import { Request, Response } from "express";
import Joke from "../models/createJokes.model";

export const deleteFunJoke = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        
        // Check if joke exists and user owns it
        const existingJoke = await Joke.findById(id);
        if (!existingJoke) {
            return res.status(404).json({ message: "Joke not found" });
        }
        
        if (userId && existingJoke.userId && existingJoke.userId.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to delete this joke" });
        }
        
        await Joke.findByIdAndDelete(id);
        return res.status(200).json({ message: "Joke deleted" });
    } catch (error) {
        return res.status(400).json({ message: "Invalid joke id" });
    }
};
