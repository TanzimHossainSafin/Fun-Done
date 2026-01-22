import { Request, Response } from "express";
import mongoose from "mongoose";
import StudyGroup from "../models/studyGroup.model";
import { getAIModeratorResponse, generateStudySessionAgenda, isAIServiceAvailable } from "../services/aiService";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

// In-memory storage for conversation history (in production, use Redis or MongoDB)
const conversationStore = new Map<string, ChatMessage[]>();

export const chatWithAIModerator = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const { message, userId, aiProvider } = req.body;

    if (!message || !userId) {
        return res.status(400).json({ message: "Message and userId are required" });
    }

    if (!isAIServiceAvailable()) {
        return res.status(503).json({ 
            message: "AI service is not available. Please configure OPENAI_API_KEY in environment variables." 
        });
    }

    try {
        const groupObjectId = new mongoose.Types.ObjectId(groupId);
        const group = await StudyGroup.findById(groupObjectId).lean();

        if (!group) {
            return res.status(404).json({ message: "Study group not found" });
        }

        // Get or initialize conversation history
        const conversationKey = `${groupId}`;
        let history = conversationStore.get(conversationKey) || [];

        // Limit history to last 10 messages to avoid token limits
        if (history.length > 10) {
            history = history.slice(-10);
        }

        // Get AI response
        const aiResponse = await getAIModeratorResponse(
            {
                groupName: group.name,
                subject: group.subject,
                memberCount: group.members.length,
            },
            history.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            message,
            aiProvider || "gemini" // Pass provider from request, default to gemini
        );

        // Update conversation history
        const userMessage: ChatMessage = {
            role: "user",
            content: message,
            timestamp: new Date(),
        };

        const assistantMessage: ChatMessage = {
            role: "assistant",
            content: aiResponse,
            timestamp: new Date(),
        };

        history.push(userMessage, assistantMessage);
        conversationStore.set(conversationKey, history);

        return res.status(200).json({
            message: "AI moderator response",
            response: aiResponse,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error("AI Moderator Chat Error:", error);
        return res.status(500).json({ 
            message: "Error communicating with AI moderator",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const generateSessionAgenda = async (req: Request, res: Response) => {
    const { topic, duration, memberGoals } = req.body;

    if (!topic || !duration) {
        return res.status(400).json({ message: "Topic and duration are required" });
    }

    if (!isAIServiceAvailable()) {
        return res.status(503).json({ 
            message: "AI service is not available. Please configure OPENAI_API_KEY in environment variables." 
        });
    }

    try {
        const agenda = await generateStudySessionAgenda(
            topic,
            duration,
            memberGoals || []
        );

        return res.status(200).json({
            message: "Study session agenda generated",
            agenda: agenda.agenda,
            objectives: agenda.objectives,
            resources: agenda.resources,
        });
    } catch (error) {
        console.error("Generate Agenda Error:", error);
        return res.status(500).json({ 
            message: "Error generating study session agenda",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const clearConversationHistory = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const conversationKey = `${groupId}`;
    
    conversationStore.delete(conversationKey);
    
    return res.status(200).json({
        message: "Conversation history cleared",
    });
};

export const getConversationHistory = async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const conversationKey = `${groupId}`;
    
    const history = conversationStore.get(conversationKey) || [];
    
    return res.status(200).json({
        message: "Conversation history retrieved",
        history: history,
    });
};
