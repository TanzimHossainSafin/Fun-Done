import { Request, Response } from "express";
import Joke from "../models/createJokes.model";
import cloudinary from "../utils/cloudinary";

export const createFunJoke = async (req: Request, res: Response) => {
    try {
        const { name, category, setup, punchline, image, userId } = req.body;
        
        // Only name and setup are required (caption), others are optional
        if (!name || !setup) {
            return res.status(400).json({ message: "Name and caption are required" });
        }

        let imageUrl = '';
        
        // Upload image to Cloudinary if provided
        if (image) {
            try {
                const uploadResult = await cloudinary.uploader.upload(image, {
                    folder: 'fun-done/jokes',
                    resource_type: 'auto'
                });
                imageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: "Failed to upload image" });
            }
        }

        const jokeData = {
            name,
            category: category || 'General',
            setup,
            punchline: punchline || '',
            imageUrl: imageUrl,
            userId: userId || null
        };

        const joke = await Joke.create(jokeData);
        return res.status(201).json({ message: "Joke created", joke });
    } catch (error) {
        console.error('Create joke error:', error);
        return res.status(400).json({ message: "Invalid joke data" });
    }
};