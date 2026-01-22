import { Request, Response } from "express";
import mongoose from "mongoose";
import Habit from "../models/habit.model";

// Helper function to get start of current period (day for daily, week for weekly)
const getPeriodStart = (frequency: "daily" | "weekly"): Date => {
    const now = new Date();
    if (frequency === "daily") {
        // Start of today
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return start;
    } else {
        // Start of current week (Monday)
        const start = new Date(now);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return start;
    }
};

// Helper function to check if period has changed and reset if needed
const checkAndResetPeriod = async (habit: any) => {
    const currentPeriodStart = getPeriodStart(habit.frequency);
    const habitPeriodStart = new Date(habit.currentPeriodStart);
    
    // Check if period has changed
    if (habitPeriodStart.getTime() !== currentPeriodStart.getTime()) {
        // Reset completed count for new period
        habit.completed = 0;
        habit.currentPeriodStart = currentPeriodStart;
        await habit.save();
    }
    
    return habit;
};

// Get all habits for a user
export const getHabits = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const habits = await Habit.find({
            userId: new mongoose.Types.ObjectId(userId),
        }).sort({ createdAt: -1 });

        // Check and reset periods for all habits
        const updatedHabits = await Promise.all(
            habits.map(habit => checkAndResetPeriod(habit))
        );

        return res.status(200).json({ habits: updatedHabits });
    } catch (error) {
        console.error("Get habits error:", error);
        return res.status(500).json({
            message: "Failed to fetch habits",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Create a new habit
export const createHabit = async (req: Request, res: Response) => {
    try {
        const { userId, name, frequency, total } = req.body;

        if (!userId || !name || !frequency) {
            return res.status(400).json({
                message: "userId, name, and frequency are required",
            });
        }

        const periodStart = getPeriodStart(frequency);
        // Daily habits: 1 per day, Weekly habits: 3 per week (default)
        const defaultTotal = total || (frequency === "daily" ? 1 : 3);

        const habit = await Habit.create({
            userId: new mongoose.Types.ObjectId(userId),
            name,
            frequency,
            total: defaultTotal,
            completed: 0,
            currentPeriodStart: periodStart,
            lastUpdated: new Date(),
        });

        return res.status(201).json({ message: "Habit created", habit });
    } catch (error) {
        console.error("Create habit error:", error);
        return res.status(400).json({
            message: "Failed to create habit",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Update habit completion
export const updateHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { completed, name, frequency, total } = req.body;

        const habit = await Habit.findById(id);
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        // Check and reset period if needed
        await checkAndResetPeriod(habit);

        // Update fields
        if (completed !== undefined) {
            habit.completed = Math.min(Math.max(0, completed), habit.total);
        }
        if (name) habit.name = name;
        if (frequency) {
            habit.frequency = frequency;
            habit.currentPeriodStart = getPeriodStart(frequency);
            // Reset completed when frequency changes
            habit.completed = 0;
        }
        if (total !== undefined) {
            habit.total = Math.max(1, total);
            // Ensure completed doesn't exceed total
            habit.completed = Math.min(habit.completed, habit.total);
        }

        habit.lastUpdated = new Date();
        await habit.save();

        return res.status(200).json({ message: "Habit updated", habit });
    } catch (error) {
        console.error("Update habit error:", error);
        return res.status(400).json({
            message: "Failed to update habit",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Increment habit completion by 1
export const incrementHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const habit = await Habit.findById(id);
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        // Check and reset period if needed
        await checkAndResetPeriod(habit);

        // Increment completed (don't exceed total)
        habit.completed = Math.min(habit.completed + 1, habit.total);
        habit.lastUpdated = new Date();
        await habit.save();

        return res.status(200).json({ message: "Habit incremented", habit });
    } catch (error) {
        console.error("Increment habit error:", error);
        return res.status(400).json({
            message: "Failed to increment habit",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Delete a habit
export const deleteHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const habit = await Habit.findByIdAndDelete(id);
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }

        return res.status(200).json({ message: "Habit deleted" });
    } catch (error) {
        console.error("Delete habit error:", error);
        return res.status(400).json({
            message: "Failed to delete habit",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
