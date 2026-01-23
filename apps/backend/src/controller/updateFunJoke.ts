import { Request, Response } from "express";
import Joke from "../models/createJokes.model";
import cloudinary from "../utils/cloudinary";

export const updateFunJoke = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, category, setup, punchline, image } = req.body;
        
        if (!name && !category && !setup && !punchline && !image) {
            return res.status(400).json({ message: "No data to update" });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (category) updateData.category = category;
        if (setup) updateData.setup = setup;
        if (punchline) updateData.punchline = punchline;

        // Upload new image to Cloudinary if provided
        if (image && image.startsWith('data:')) {
            try {
                const uploadResult = await cloudinary.uploader.upload(image, {
                    folder: 'udyomix/jokes',
                    resource_type: 'auto'
                });
                updateData.imageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: "Failed to upload image" });
            }
        } else if (image) {
            updateData.imageUrl = image; // Keep existing URL
        }

        const updatedJoke = await Joke.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
        
        if (!updatedJoke) {
            return res.status(404).json({ message: "Joke not found" });
        }
        
        return res.status(200).json({ message: "Joke updated", joke: updatedJoke });
    } catch (error) {
        console.error('Update joke error:', error);
        return res.status(400).json({ message: "Invalid joke data" });
    }
};
