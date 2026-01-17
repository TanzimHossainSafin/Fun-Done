import axios from "axios";
import type { MockInterview, InterviewFeedback, InterviewSummary, InterviewQuestion } from "../types";

const BASE_URL = "http://localhost:3000/app/v1/interview";

/**
 * Start a new mock interview
 */
export const startMockInterview = async (payload: {
    userId: string;
    targetRole: string;
    targetCompany?: string;
    industry?: string;
    interviewType?: "technical" | "behavioral" | "mixed" | "case-study";
    difficulty?: "easy" | "medium" | "hard";
}): Promise<{ interviewId: string; firstQuestion: InterviewQuestion }> => {
    const response = await axios.post(`${BASE_URL}/start`, payload);
    return response.data;
};

/**
 * Submit answer to interview question
 */
export const submitInterviewAnswer = async (
    interviewId: string,
    questionId: string,
    answer: string,
    timeTaken: number
): Promise<{ success: boolean; feedback: InterviewFeedback; hasMoreQuestions: boolean }> => {
    const response = await axios.post(`${BASE_URL}/answer`, {
        interviewId,
        questionId,
        answer,
        timeTaken,
    });
    return response.data;
};

/**
 * Get next question in the interview
 */
export const getNextQuestion = async (
    interviewId: string
): Promise<{ success: boolean; question: InterviewQuestion; questionNumber: number; totalQuestions: number }> => {
    const response = await axios.get(`${BASE_URL}/next-question/${interviewId}`);
    return response.data;
};

/**
 * Complete mock interview and get summary
 */
export const completeMockInterview = async (
    interviewId: string
): Promise<{ success: boolean; overallScore: number; message: string }> => {
    const response = await axios.post(`${BASE_URL}/complete`, { interviewId });
    return response.data;
};

/**
 * Get interview results
 */
export const getInterviewResults = async (
    interviewId: string
): Promise<{ interview: MockInterview; summary: InterviewSummary }> => {
    const response = await axios.get(`${BASE_URL}/results/${interviewId}`);
    return response.data;
};

/**
 * Get user's interview history
 */
export const getUserInterviewHistory = async (
    userId: string
): Promise<{ success: boolean; interviews: MockInterview[] }> => {
    const response = await axios.get(`${BASE_URL}/history/${userId}`);
    return response.data;
};
