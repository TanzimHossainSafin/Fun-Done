import mongoose from "mongoose";

interface GroupChatMessageInterface extends mongoose.Document {
    groupId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    username: string;
    message: string;
    replyTo?: mongoose.Types.ObjectId; // Reference to another message
    replyToMessage?: string; // Preview of the replied message
    replyToUsername?: string; // Username of the replied message author
    createdAt: Date;
    updatedAt: Date;
}

const groupChatMessageSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyGroup",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GroupChatMessage",
            required: false,
        },
        replyToMessage: {
            type: String,
            required: false,
        },
        replyToUsername: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
groupChatMessageSchema.index({ groupId: 1, createdAt: -1 });

const GroupChatMessage = mongoose.model<GroupChatMessageInterface>(
    "GroupChatMessage",
    groupChatMessageSchema
);

export default GroupChatMessage;
