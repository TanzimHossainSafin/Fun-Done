import mongoose from "mongoose";

interface StudyGroupInterface extends mongoose.Document {
    name: string;
    subject: string;
    description: string;
    createdBy: mongoose.Types.ObjectId;
    members: Array<{
        userId: mongoose.Types.ObjectId;
        role: "admin" | "moderator" | "member";
        joinedAt: Date;
    }>;
    meetingSuggestions: string[];
    aiModeratorName?: string;
}

const studyGroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                role: {
                    type: String,
                    enum: ["admin", "moderator", "member"],
                    default: "member",
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        meetingSuggestions: {
            type: [String],
            default: [],
        },
        aiModeratorName: {
            type: String,
            default: "Udyomix AI Moderator",
        },
    },
    {
        timestamps: true,
    }
);

const StudyGroup = mongoose.model<StudyGroupInterface>(
    "StudyGroup",
    studyGroupSchema
);

export default StudyGroup;
