import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    questionType: { 
        type: String, 
        enum: ["behavioral", "technical", "situational", "case-study", "coding"],
        required: true 
    },
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    expectedKeywords: [String], // Keywords that should appear in good answers
    category: String // "OOP", "Leadership", "Problem-solving", etc.
});

const interviewResponseSchema = new mongoose.Schema({
    questionId: mongoose.Schema.Types.ObjectId,
    questionText: String,
    userAnswer: String,
    audioRecording: String, // URL if voice was used
    timeTaken: Number, // seconds
    timestamp: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
    questionId: mongoose.Schema.Types.ObjectId,
    overallScore: { type: Number, min: 0, max: 10 },
    strengths: [String],
    improvements: [String],
    missingKeywords: [String],
    communicationScore: Number, // 0-10
    technicalAccuracy: Number, // 0-10
    structureScore: Number, // 0-10 (STAR method for behavioral)
    suggestions: String
});

const mockInterviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetRole: { type: String, required: true }, // "Software Engineer", "Marketing Manager", etc.
    targetCompany: String, // "Grameenphone", "BRAC Bank", etc.
    industry: String,
    interviewType: { 
        type: String, 
        enum: ["technical", "behavioral", "mixed", "case-study"],
        default: "mixed"
    },
    questions: [interviewQuestionSchema],
    responses: [interviewResponseSchema],
    feedback: [feedbackSchema],
    overallScore: { type: Number, min: 0, max: 100 },
    duration: Number, // Total duration in seconds
    status: { 
        type: String, 
        enum: ["scheduled", "in-progress", "completed", "abandoned"],
        default: "in-progress"
    },
    summary: {
        strengths: [String],
        areasToImprove: [String],
        readinessLevel: { type: String, enum: ["not-ready", "needs-practice", "ready", "well-prepared"] },
        recommendations: [String]
    },
    voiceEnabled: { type: Boolean, default: false },
    completedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

// Index for queries
mockInterviewSchema.index({ userId: 1, createdAt: -1 });
mockInterviewSchema.index({ status: 1 });
mockInterviewSchema.index({ targetRole: 1, targetCompany: 1 });

const MockInterview = mongoose.model("MockInterview", mockInterviewSchema);

export default MockInterview;
