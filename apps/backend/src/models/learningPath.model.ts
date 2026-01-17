import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
    skills: [String],
    resources: [{
        title: String,
        type: { type: String, enum: ["video", "article", "course", "practice", "project"] },
        url: String,
        duration: String
    }],
    tasks: [{
        title: String,
        description: String,
        completed: { type: Boolean, default: false }
    }],
    completed: { type: Boolean, default: false },
    completedDate: Date,
    certificateUrl: String
});

const learningPathSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    careerPathId: { type: mongoose.Schema.Types.ObjectId, ref: "CareerPath", required: true },
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "SkillAssessment" },
    targetRole: { type: String, required: true },
    skillGaps: [{
        skillName: String,
        currentLevel: String,
        targetLevel: String,
        priority: { type: String, enum: ["high", "medium", "low"] }
    }],
    milestones: [milestoneSchema],
    totalWeeks: { type: Number, required: true },
    currentWeek: { type: Number, default: 1 },
    overallProgress: { type: Number, min: 0, max: 100, default: 0 },
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,
    status: { 
        type: String, 
        enum: ["active", "paused", "completed", "abandoned"],
        default: "active"
    },
    lastActivityDate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
learningPathSchema.pre('save', function() {
    this.updatedAt = new Date();
});

// Indexes
learningPathSchema.index({ userId: 1, status: 1 });
learningPathSchema.index({ careerPathId: 1 });

const LearningPath = mongoose.model("LearningPath", learningPathSchema);

export default LearningPath;
