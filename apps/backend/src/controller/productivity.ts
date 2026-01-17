import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductivitySession from "../models/productivitySession.model";
import Schedule from "../models/schedule.model";
import { analyzeProductivityPatterns, predictExamStress } from "../services/aiService";

export const logProductivitySession = async (req: Request, res: Response) => {
    try {
        const { userId, subject, duration, startTime, productivity, interruptions } = req.body;

        if (!userId || !subject || !duration || !startTime) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const start = new Date(startTime);
        const end = new Date(start.getTime() + duration * 60000);

        const session = await ProductivitySession.create({
            userId: new mongoose.Types.ObjectId(userId),
            subject,
            duration,
            startTime: start,
            endTime: end,
            sessionType: "focus",
            productivity: productivity || 3,
            interruptions: interruptions || 0,
        });

        return res.status(201).json({
            message: "Session logged successfully",
            session,
        });
    } catch (error) {
        console.error("Log session error:", error);
        return res.status(500).json({
            message: "Failed to log session",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const getProductivityReport = async (req: Request, res: Response) => {
    try {
        const { userId, period = "week" } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        if (period === "day") {
            startDate.setDate(now.getDate() - 1);
        } else if (period === "week") {
            startDate.setDate(now.getDate() - 7);
        } else if (period === "month") {
            startDate.setMonth(now.getMonth() - 1);
        }

        const sessions = await ProductivitySession.find({
            userId: new mongoose.Types.ObjectId(userId as string),
            startTime: { $gte: startDate },
        }).sort({ startTime: -1 });

        // Calculate statistics
        const totalSessions = sessions.length;
        const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        const avgProductivity = sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.productivity, 0) / sessions.length
            : 0;

        // Subject breakdown
        const subjectStats: Record<string, { count: number; totalMinutes: number; avgProductivity: number }> = {};
        sessions.forEach(session => {
            if (!subjectStats[session.subject]) {
                subjectStats[session.subject] = { count: 0, totalMinutes: 0, avgProductivity: 0 };
            }
            subjectStats[session.subject].count++;
            subjectStats[session.subject].totalMinutes += session.duration;
            subjectStats[session.subject].avgProductivity += session.productivity;
        });

        Object.keys(subjectStats).forEach(subject => {
            subjectStats[subject].avgProductivity /= subjectStats[subject].count;
        });

        // Daily breakdown
        const dailyStats: Record<string, { sessions: number; minutes: number }> = {};
        sessions.forEach(session => {
            const date = session.startTime.toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { sessions: 0, minutes: 0 };
            }
            dailyStats[date].sessions++;
            dailyStats[date].minutes += session.duration;
        });

        return res.status(200).json({
            report: {
                period,
                totalSessions,
                totalHours: (totalMinutes / 60).toFixed(1),
                avgProductivity: avgProductivity.toFixed(1),
                subjectBreakdown: subjectStats,
                dailyBreakdown: dailyStats,
                sessions: sessions.slice(0, 10), // Last 10 sessions
            },
        });
    } catch (error) {
        console.error("Get report error:", error);
        return res.status(500).json({
            message: "Failed to generate report",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const analyzeProductivity = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        // Get last 30 days of sessions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sessions = await ProductivitySession.find({
            userId: new mongoose.Types.ObjectId(userId),
            startTime: { $gte: thirtyDaysAgo },
        }).sort({ startTime: -1 });

        if (sessions.length === 0) {
            return res.status(404).json({
                message: "No session data found. Start tracking your study sessions first.",
            });
        }

        // Prepare data for AI
        const sessionData = sessions.map(s => ({
            subject: s.subject,
            duration: s.duration,
            startTime: s.startTime,
            productivity: s.productivity,
            timeOfDay: s.startTime.getHours() < 12 ? "Morning" :
                       s.startTime.getHours() < 17 ? "Afternoon" : "Evening",
        }));

        const analysis = await analyzeProductivityPatterns(sessionData);

        return res.status(200).json({
            message: "Productivity analysis complete",
            analysis,
        });
    } catch (error) {
        console.error("Analyze productivity error:", error);
        return res.status(500).json({
            message: "Failed to analyze productivity",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const predictStress = async (req: Request, res: Response) => {
    try {
        const { userId, currentWorkload } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        // Get schedule events
        const schedule = await Schedule.findOne({
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (!schedule || !schedule.events || schedule.events.length === 0) {
            return res.status(404).json({
                message: "No schedule found. Add events to your schedule first.",
            });
        }

        // Filter upcoming events (next 30 days)
        const now = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(now.getDate() + 30);

        const upcomingEvents = schedule.events
            .filter(e => new Date(e.start) >= now && new Date(e.start) <= thirtyDaysLater)
            .map(e => ({
                title: e.title,
                type: e.type,
                start: new Date(e.start),
                end: new Date(e.end),
                priority: e.priority,
            }));

        const prediction = await predictExamStress(upcomingEvents, currentWorkload || 20);

        return res.status(200).json({
            message: "Stress prediction complete",
            prediction,
        });
    } catch (error) {
        console.error("Stress prediction error:", error);
        return res.status(500).json({
            message: "Failed to predict stress",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
