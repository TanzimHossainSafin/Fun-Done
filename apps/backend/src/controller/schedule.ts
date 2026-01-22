import { Request, Response } from "express";
import mongoose from "mongoose";
import Schedule from "../models/schedule.model";
import {
    optimizeScheduleSchema,
    scheduleEventSchema,
    scheduleSchema,
} from "../utils/validation";
import { generateStudyPlan } from "../utils/scheduleOptimizer";
import { analyzeScheduleWithAI, suggestHabitsWithAI } from "../services/aiService";

export const upsertSchedule = async (req: Request, res: Response) => {
    const validationResult = scheduleSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Bad Request Please make sure your data format is correct",
            errors: validationResult.error.flatten(),
        });
    }

    const { userId, events, productiveHours } = validationResult.data;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const schedule = await Schedule.findOneAndUpdate(
        { userId: userObjectId },
        {
            userId: userObjectId,
            productiveHours,
            events: (events || []).map((event) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            })),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: "Schedule saved", schedule });
};

export const getSchedule = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const schedule = await Schedule.findOne({
        userId: new mongoose.Types.ObjectId(userId),
    });
    if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
    }
    return res.status(200).json({ schedule });
};

export const addScheduleEvent = async (req: Request, res: Response) => {
    const validationResult = scheduleEventSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Bad Request Please make sure your data format is correct",
            errors: validationResult.error.flatten(),
        });
    }

    const { userId, title, start, end, type, priority } =
        validationResult.data;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const schedule = await Schedule.findOneAndUpdate(
        { userId: userObjectId },
        {
            $push: {
                events: {
                    title,
                    start: new Date(start),
                    end: new Date(end),
                    type,
                    priority,
                },
            },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ message: "Event added", schedule });
};

export const optimizeSchedule = async (req: Request, res: Response) => {
    const validationResult = optimizeScheduleSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            message: "Bad Request Please make sure your data format is correct",
            errors: validationResult.error.flatten(),
        });
    }

    const { userId, preferredStudyBlocks } = validationResult.data;
    const schedule = await Schedule.findOne({
        userId: new mongoose.Types.ObjectId(userId),
    });

    const events = schedule?.events || [];
    const productiveHours = schedule?.productiveHours || [];

    const suggestions = generateStudyPlan(
        events.map((event) => ({
            title: event.title,
            start: event.start,
            end: event.end,
            type: event.type,
            priority: event.priority,
        })),
        productiveHours,
        preferredStudyBlocks || [],
        7
    );

    return res.status(200).json({
        message: "Study plan generated",
        suggestions,
    });
};

export const analyzeSchedule = async (req: Request, res: Response) => {
    try {
        const { userId, studyGoals } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const schedule = await Schedule.findOne({
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!schedule || !schedule.events || schedule.events.length === 0) {
            return res.status(404).json({ 
                message: "No schedule found. Add events to your schedule first." 
            });
        }

        const events = schedule.events.map((event) => ({
            title: event.title,
            start: event.start,
            end: event.end,
            type: event.type,
            priority: event.priority,
        }));

        const analysis = await analyzeScheduleWithAI(
            events,
            schedule.productiveHours || [],
            studyGoals
        );

        return res.status(200).json({
            message: "Schedule analyzed successfully",
            analysis,
        });
    } catch (error) {
        console.error("Schedule analysis error:", error);
        return res.status(500).json({ 
            message: "Failed to analyze schedule",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const deleteScheduleEvent = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const { title, start, end, type, priority } = req.body;

        if (!userId || !title || !start || !end) {
            return res.status(400).json({
                message: "userId, title, start, and end are required",
            });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const eventStart = new Date(start);
        const eventEnd = new Date(end);

        // Find and remove the matching event
        const schedule = await Schedule.findOne({ userId: userObjectId });
        
        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        // Remove the event that matches all provided fields
        const updatedSchedule = await Schedule.findOneAndUpdate(
            { userId: userObjectId },
            {
                $pull: {
                    events: {
                        title,
                        start: eventStart,
                        end: eventEnd,
                        ...(type && { type }),
                        ...(priority !== undefined && { priority }),
                    },
                },
            },
            { new: true }
        );

        if (!updatedSchedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        return res.status(200).json({ message: "Event deleted", schedule: updatedSchedule });
    } catch (error) {
        console.error("Delete event error:", error);
        return res.status(400).json({
            message: "Failed to delete event",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const suggestHabits = async (req: Request, res: Response) => {
    try {
        const { currentHabits, studyGoals } = req.body;
        
        if (!currentHabits || !Array.isArray(currentHabits)) {
            return res.status(400).json({ 
                message: "currentHabits array is required" 
            });
        }

        const suggestions = await suggestHabitsWithAI(currentHabits, studyGoals);

        return res.status(200).json({
            message: "Habit suggestions generated successfully",
            suggestions,
        });
    } catch (error) {
        console.error("Habit suggestions error:", error);
        return res.status(500).json({ 
            message: "Failed to generate habit suggestions",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
