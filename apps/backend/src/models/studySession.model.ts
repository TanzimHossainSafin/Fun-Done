import mongoose from "mongoose";

interface StudySessionInterface extends mongoose.Document {
    groupId: mongoose.Types.ObjectId;
    topic: string;
    startedAt: Date;
    endedAt?: Date;
    durationMinutes?: number;
    createdBy: mongoose.Types.ObjectId;
}

const studySessionSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StudyGroup",
            required: true,
        },
        topic: {
            type: String,
            required: true,
        },
        startedAt: {
            type: Date,
            required: true,
        },
        endedAt: {
            type: Date,
        },
        durationMinutes: {
            type: Number,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const StudySession = mongoose.model<StudySessionInterface>(
    "StudySession",
    studySessionSchema
);

export default StudySession;
