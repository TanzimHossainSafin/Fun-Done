import axios from "axios";
import type { Schedule, StudySuggestion, ScheduleAnalysis, HabitData, HabitSuggestions } from "../types";

const BASE_URL = "http://localhost:3000/app/v1/study";

export const saveSchedule = async (payload: {
    userId: string;
    productiveHours: string[];
    events: Array<{
        title: string;
        start: string;
        end: string;
        type: "class" | "study" | "exam" | "personal";
        priority: number;
    }>;
}) => {
    const result = await axios.post(`${BASE_URL}/schedule`, payload);
    return result.data as { schedule: Schedule };
};

export const fetchSchedule = async (userId: string) => {
    const result = await axios.get(`${BASE_URL}/schedule/${userId}`);
    return result.data as { schedule: Schedule };
};

export const addScheduleEvent = async (payload: {
    userId: string;
    title: string;
    start: string;
    end: string;
    type: "class" | "study" | "exam" | "personal";
    priority: number;
}) => {
    const result = await axios.post(`${BASE_URL}/schedule/event`, payload);
    return result.data as { schedule: Schedule };
};

export const optimizeSchedule = async (payload: {
    userId: string;
    preferredStudyBlocks: Array<{
        subject: string;
        minutes: number;
        priority: number;
    }>;
}) => {
    const result = await axios.post(`${BASE_URL}/schedule/optimize`, payload);
    return result.data as { suggestions: StudySuggestion[] };
};

export const analyzeSchedule = async (payload: {
    userId: string;
    studyGoals?: string[];
}) => {
    const result = await axios.post(`${BASE_URL}/schedule/analyze`, payload);
    return result.data as { analysis: ScheduleAnalysis };
};

export const suggestHabits = async (payload: {
    currentHabits: HabitData[];
    studyGoals?: string[];
}) => {
    const result = await axios.post(`${BASE_URL}/schedule/habits`, payload);
    return result.data as { suggestions: HabitSuggestions };
};

