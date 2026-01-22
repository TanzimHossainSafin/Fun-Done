import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import GroupChatMessage from "../models/groupChat.model";
import StudyGroup from "../models/studyGroup.model";
import User from "../models/user.model";
import mongoose from "mongoose";

interface SocketUser {
    userId: string;
    username: string;
    socketId: string;
}

interface ChatMessage {
    _id: string;
    groupId: string;
    userId: string;
    username: string;
    message: string;
    replyTo?: string;
    replyToMessage?: string;
    replyToUsername?: string;
    createdAt: Date;
}

let io: SocketIOServer | null = null;
const groupUsers = new Map<string, Set<string>>(); // groupId -> Set of socketIds

export const initializeSocket = (httpServer: HTTPServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5175"],
            credentials: true,
        },
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            // Try to get token from auth, cookies, or query
            let token = socket.handshake.auth.token;
            
            if (!token) {
                // Try to get from cookies
                const cookies = socket.handshake.headers.cookie;
                if (cookies) {
                    const tokenMatch = cookies.match(/udyomix_token=([^;]+)/);
                    token = tokenMatch ? tokenMatch[1] : null;
                }
            }

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const secret = process.env.JWT_SECRET || "dev_jwt_secret";
            const decoded = jwt.verify(token, secret) as { userId: string; email: string };
            
            const user = await User.findById(decoded.userId);
            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.data.userId = decoded.userId;
            socket.data.username = user.username;
            next();
        } catch (error: any) {
            console.error("Socket authentication error:", error.message);
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        // Join a study group room
        socket.on("join_group", async (groupId: string) => {
            try {
                // Verify user is member of the group
                const group = await StudyGroup.findById(groupId);
                if (!group) {
                    socket.emit("error", { message: "Group not found" });
                    return;
                }

                const userObjectId = new mongoose.Types.ObjectId(socket.data.userId);
                const isMember = group.members.some(
                    (member) => member.userId.toString() === userObjectId.toString()
                );

                // Also check if user is the creator
                const isCreator = group.createdBy.toString() === userObjectId.toString();

                if (!isMember && !isCreator) {
                    socket.emit("error", { message: "You are not a member of this group" });
                    return;
                }

                socket.join(`group_${groupId}`);
                
                // Track group users
                if (!groupUsers.has(groupId)) {
                    groupUsers.set(groupId, new Set());
                }
                groupUsers.get(groupId)!.add(socket.id);

                socket.emit("joined_group", { groupId });
            } catch (error) {
                console.error("Join group error:", error);
                socket.emit("error", { message: "Failed to join group" });
            }
        });

        // Leave a study group room
        socket.on("leave_group", (groupId: string) => {
            socket.leave(`group_${groupId}`);
            
            if (groupUsers.has(groupId)) {
                groupUsers.get(groupId)!.delete(socket.id);
                if (groupUsers.get(groupId)!.size === 0) {
                    groupUsers.delete(groupId);
                }
            }

            socket.emit("left_group", { groupId });
        });

        // Send a message
        socket.on("send_message", async (data: {
            groupId: string;
            message: string;
            replyTo?: string;
        }) => {
            try {
                const { groupId, message, replyTo } = data;

                // Verify user is member of the group
                const group = await StudyGroup.findById(groupId);
                if (!group) {
                    socket.emit("error", { message: "Group not found" });
                    return;
                }

                const userObjectId = new mongoose.Types.ObjectId(socket.data.userId);
                const isMember = group.members.some(
                    (member) => member.userId.toString() === userObjectId.toString()
                );

                // Also check if user is the creator
                const isCreator = group.createdBy.toString() === userObjectId.toString();

                if (!isMember && !isCreator) {
                    socket.emit("error", { message: "You are not a member of this group" });
                    return;
                }

                // If replying, get the original message
                let replyToMessage: string | undefined;
                let replyToUsername: string | undefined;
                if (replyTo) {
                    const originalMessage = await GroupChatMessage.findById(replyTo);
                    if (originalMessage) {
                        replyToMessage = originalMessage.message;
                        replyToUsername = originalMessage.username;
                    }
                }

                // Save message to database
                const chatMessage = new GroupChatMessage({
                    groupId: new mongoose.Types.ObjectId(groupId),
                    userId: userObjectId,
                    username: socket.data.username,
                    message: message.trim(),
                    replyTo: replyTo ? new mongoose.Types.ObjectId(replyTo) : undefined,
                    replyToMessage,
                    replyToUsername,
                });

                await chatMessage.save();

                // Prepare message for clients
                // Ensure userId is always a string (convert ObjectId if needed)
                const userIdString = typeof socket.data.userId === 'string' 
                    ? socket.data.userId 
                    : String(socket.data.userId);
                
                const messageData: ChatMessage = {
                    _id: chatMessage._id.toString(),
                    groupId,
                    userId: userIdString,
                    username: socket.data.username,
                    message: chatMessage.message,
                    replyTo: replyTo,
                    replyToMessage,
                    replyToUsername,
                    createdAt: chatMessage.createdAt,
                };

                // Broadcast to all users in the group
                io!.to(`group_${groupId}`).emit("new_message", messageData);
            } catch (error) {
                console.error("Send message error:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Delete/Unsend a message
        socket.on("delete_message", async (data: {
            groupId: string;
            messageId: string;
        }) => {
            try {
                const { groupId, messageId } = data;

                // Find the message
                const message = await GroupChatMessage.findById(messageId);
                if (!message) {
                    socket.emit("error", { message: "Message not found" });
                    return;
                }

                // Verify user owns the message (strict check)
                const userObjectId = new mongoose.Types.ObjectId(socket.data.userId);
                const messageUserId = new mongoose.Types.ObjectId(message.userId);
                
                if (!messageUserId.equals(userObjectId)) {
                    socket.emit("error", { message: "You can only delete your own messages" });
                    return;
                }

                // Verify user is member of the group
                const group = await StudyGroup.findById(groupId);
                if (!group) {
                    socket.emit("error", { message: "Group not found" });
                    return;
                }

                const isMember = group.members.some(
                    (member) => member.userId.toString() === userObjectId.toString()
                );
                const isCreator = group.createdBy.toString() === userObjectId.toString();

                if (!isMember && !isCreator) {
                    socket.emit("error", { message: "You are not a member of this group" });
                    return;
                }

                // Delete the message from database
                await GroupChatMessage.findByIdAndDelete(messageId);

                // Broadcast deletion to all users in the group
                io!.to(`group_${groupId}`).emit("message_deleted", { messageId });
            } catch (error) {
                console.error("Delete message error:", error);
                socket.emit("error", { message: "Failed to delete message" });
            }
        });

        // Typing indicator
        socket.on("typing", (data: { groupId: string; isTyping: boolean }) => {
            socket.to(`group_${data.groupId}`).emit("user_typing", {
                userId: socket.data.userId,
                username: socket.data.username,
                isTyping: data.isTyping,
            });
        });

        socket.on("disconnect", () => {
            // Remove from all groups
            groupUsers.forEach((socketIds, groupId) => {
                socketIds.delete(socket.id);
                if (socketIds.size === 0) {
                    groupUsers.delete(groupId);
                }
            });
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};
