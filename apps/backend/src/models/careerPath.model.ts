import mongoose from "mongoose";

const skillRequirementSchema = new mongoose.Schema({
    skillName: { type: String, required: true },
    percentage: { type: Number, required: true }, // % of jobs requiring this skill
    priority: { type: String, enum: ["essential", "important", "nice-to-have"], required: true }
});

const jobPostingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    source: { type: String, required: true }, // "Bdjobs", "LinkedIn", etc.
    url: String,
    skills: [String],
    salary: String,
    scrapedAt: { type: Date, default: Date.now }
});

const careerPathSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetRole: { type: String, required: true }, // "Software Engineer", "Data Analyst", etc.
    industry: String, // "Technology", "Banking", "Healthcare", etc.
    requiredSkills: [skillRequirementSchema],
    analyzedJobPostings: [jobPostingSchema],
    totalJobsAnalyzed: { type: Number, default: 0 },
    averageSalary: String,
    topCompanies: [String],
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Index for fast queries
careerPathSchema.index({ userId: 1, targetRole: 1 });
careerPathSchema.index({ createdAt: -1 });

const CareerPath = mongoose.model("CareerPath", careerPathSchema);

export default CareerPath;
