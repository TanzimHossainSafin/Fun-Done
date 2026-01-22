import mongoose from "mongoose";

interface StudyProfileInterface extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    subjects: string[];
    studyTimes: string[];
    learningStyle?: string;
    goals: string[];
}

const studyProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        subjects: {
            type: [String],
            required: true,
            default: [],
        },
        studyTimes: {
            type: [String],
            default: [],
        },
        learningStyle: {
            type: String,
            enum: ["visual", "auditory", "kinesthetic", "reading_writing"],
        },
        goals: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const StudyProfile = mongoose.model<StudyProfileInterface>(
    "StudyProfile",
    studyProfileSchema
);

export default StudyProfile;
