import mongoose from "mongoose";

const assessmentQuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    skillCategory: { type: String, required: true }, // "Python", "SQL", "Git", etc.
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    options: [String], // For multiple choice
    correctAnswer: String,
    codeChallenge: {
        prompt: String,
        testCases: [{
            input: String,
            expectedOutput: String
        }],
        language: String
    }
});

const userResponseSchema = new mongoose.Schema({
    questionId: mongoose.Schema.Types.ObjectId,
    userAnswer: String,
    isCorrect: Boolean,
    timeTaken: Number, // seconds
    codeSubmitted: String
});

const skillScoreSchema = new mongoose.Schema({
    skillName: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    level: { type: String, enum: ["beginner", "intermediate", "advanced", "expert"] },
    questionsAnswered: Number,
    questionsCorrect: Number
});

const skillAssessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    careerPathId: { type: mongoose.Schema.Types.ObjectId, ref: "CareerPath" },
    targetRole: { type: String, required: true },
    questions: [assessmentQuestionSchema],
    responses: [userResponseSchema],
    skillScores: [skillScoreSchema],
    overallScore: { type: Number, min: 0, max: 100 },
    duration: Number, // Total time taken in seconds
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    completedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

// Index for queries
skillAssessmentSchema.index({ userId: 1, createdAt: -1 });
skillAssessmentSchema.index({ careerPathId: 1 });

const SkillAssessment = mongoose.model("SkillAssessment", skillAssessmentSchema);

export default SkillAssessment;
