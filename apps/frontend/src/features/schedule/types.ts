export type ScheduleEventType = "class" | "study" | "exam" | "personal" | "assignment" | "break" | "other";

export type ScheduleEvent = {
    _id?: string;
    title: string;
    start: string;
    end: string;
    type: ScheduleEventType;
    priority: number;
};

export type Schedule = {
    _id: string;
    userId: string;
    productiveHours: string[];
    events: ScheduleEvent[];
};

export type StudySuggestion = {
    subject: string;
    start: string;
    end: string;
    minutes: number;
    priority: number;
};

export interface ScheduleAnalysis {
    productivityScore: number;
    analysis: string;
    recommendations: string[];
    warnings: string[];
}

export interface HabitData {
    _id?: string;
    name: string;
    frequency: "daily" | "weekly";
    completed: number;
    total: number;
}

export interface HabitSuggestions {
    habitPerformance: string;
    newHabits: Array<{
        name: string;
        description: string;
        frequency: string;
    }>;
    implementationTips: string[];
    motivation: string;
}

export interface PreferredStudyBlock {
    subject: string;
    duration: number;
    priority: number;
}
