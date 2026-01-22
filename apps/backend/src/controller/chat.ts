import { Request, Response } from "express";

/**
 * Chat endpoint using Gemini API
 */
export const chat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            res.status(400).json({ 
                error: "Message is required and must be a string" 
            });
            return;
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

        if (!API_KEY) {
            res.status(500).json({ 
                error: "Gemini API key is not configured" 
            });
            return;
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ text: message }] 
                    }]
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            res.status(response.status).json({ 
                error: "Gemini API error", 
                details: errorData 
            });
            return;
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error in chat endpoint:", error);
        res.status(500).json({ 
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
