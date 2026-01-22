import { Request, Response } from "express";
import mongoose from "mongoose";
import GroupChatMessage from "../models/groupChat.model";
import StudyGroup from "../models/studyGroup.model";

/**
 * Get chat messages for a study group
 * GET /study/groups/:groupId/chat
 */
export const getGroupChatMessages = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const limit = Number(req.query.limit) || 50;
        const before = req.query.before as string; // For pagination

        const groupObjectId = new mongoose.Types.ObjectId(groupId);

        // Verify group exists
        const group = await StudyGroup.findById(groupObjectId);
        if (!group) {
            return res.status(404).json({ message: "Study group not found" });
        }

        // Build query
        const query: any = { groupId: groupObjectId };
        if (before) {
            query._id = { $lt: new mongoose.Types.ObjectId(before) };
        }

        // Fetch messages
        const messages = await GroupChatMessage.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Convert messages to ensure userId is a string
        const formattedMessages = messages.map((msg: any) => ({
            ...msg,
            _id: msg._id.toString(),
            userId: msg.userId.toString(),
            groupId: msg.groupId.toString(),
            replyTo: msg.replyTo ? msg.replyTo.toString() : undefined,
        }));

        return res.status(200).json({
            messages: formattedMessages.reverse(), // Reverse to show oldest first
            hasMore: messages.length === limit,
        });
    } catch (error: any) {
        console.error("Get group chat messages error:", error);
        return res.status(500).json({
            message: "Failed to fetch chat messages",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/**
 * Get a single message by ID (for reply preview)
 * GET /study/groups/:groupId/chat/:messageId
 */
export const getChatMessage = async (req: Request, res: Response) => {
    try {
        const { groupId, messageId } = req.params;

        const message = await GroupChatMessage.findOne({
            _id: new mongoose.Types.ObjectId(messageId),
            groupId: new mongoose.Types.ObjectId(groupId),
        }).lean();

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        return res.status(200).json({ message });
    } catch (error: any) {
        console.error("Get chat message error:", error);
        return res.status(500).json({
            message: "Failed to fetch message",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
