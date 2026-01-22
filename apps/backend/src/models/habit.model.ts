import mongoose from "mongoose";

interface HabitInterface extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    frequency: "daily" | "weekly";
    completed: number;
    total: number;
    currentPeriodStart: Date; // Start of current week (for weekly) or current day (for daily)
    lastUpdated: Date;
}

const habitSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        frequency: {
            type: String,
            enum: ["daily", "weekly"],
            required: true,
        },
        completed: {
            type: Number,
            default: 0,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 1,
        },
        currentPeriodStart: {
            type: Date,
            default: Date.now,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Index for faster queries
habitSchema.index({ userId: 1, currentPeriodStart: -1 });

const Habit = mongoose.model<HabitInterface>("Habit", habitSchema);

export default Habit;
