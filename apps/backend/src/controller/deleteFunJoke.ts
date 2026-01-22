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
        
        // Convert both userIds to strings for comparison
        const existingUserId = existingJoke.userId ? String(existingJoke.userId) : null;
        const requestUserId = userId ? String(userId) : null;
        
        console.log("Delete request - Joke ID:", id);
        console.log("Existing userId:", existingUserId);
        console.log("Request userId:", requestUserId);
        
        // If userId is provided, check ownership
        if (requestUserId) {
            if (!existingUserId) {
                // Joke has no owner, allow deletion for backward compatibility
                console.log("Joke has no userId, allowing deletion");
            } else if (existingUserId !== requestUserId) {
                console.log("UserId mismatch - denying deletion");
                return res.status(403).json({ message: "You don't have permission to delete this joke" });
            } else {
                console.log("UserId matches - allowing deletion");
            }
        }
        
        await Joke.findByIdAndDelete(id);
        return res.status(200).json({ message: "Joke deleted" });
    } catch (error: any) {
        console.error("Delete error:", error);
        return res.status(400).json({ message: error.message || "Invalid joke id" });
    }
};
