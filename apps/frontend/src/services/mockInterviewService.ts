import axios from "axios";

const BASE_URL = "http://localhost:3000/app/v1/interview";

export interface InterviewQuestion {
    _id: string;
    questionText: string;
    questionType: "behavioral" | "technical" | "situational" | "case-study" | "coding";
    difficulty: "easy" | "medium" | "hard";
    category: string;
}

export interface InterviewFeedback {
    overallScore: number;
    strengths: string[];
    improvements: string[];
    missingKeywords: string[];
    communicationScore: number;
    technicalAccuracy: number;
    structureScore: number;
    suggestions: string;
    exampleAnswer?: string;
    questionNumber?: number;
    totalQuestions?: number;
}

export interface InterviewSummary {
    strengths: string[];
    areasToImprove: string[];
    readinessLevel: "not-ready" | "needs-practice" | "ready" | "well-prepared";
    recommendations: string[];
}

export interface MockInterviewData {
    interviewId: string;
    questions: InterviewQuestion[];
    totalQuestions: number;
    voiceEnabled: boolean;
}

/**
 * Start a new mock interview
 */
export const startMockInterview = async (
    userId: string,
    targetRole: string,
    targetCompany?: string,
    industry?: string,
    interviewType?: "technical" | "behavioral" | "mixed" | "case-study",
    voiceEnabled?: boolean
): Promise<MockInterviewData> => {
    const response = await axios.post(`${BASE_URL}/start`, {
        userId,
        targetRole,
        targetCompany,
        industry,
        interviewType,
        voiceEnabled
    });
    return response.data.data;
};

/**
 * Submit answer to interview question
 */
export const submitInterviewAnswer = async (
    interviewId: string,
    questionId: string,
    userAnswer: string,
    timeTaken: number,
    audioRecording?: string
): Promise<{ feedback: InterviewFeedback }> => {
    const response = await axios.post(`${BASE_URL}/answer`, {
        interviewId,
        questionId,
        userAnswer,
        timeTaken,
        audioRecording
    });
    return response.data.data;
};

/**
 * Complete mock interview and get summary
 */
export const completeMockInterview = async (
    interviewId: string
): Promise<{
    interviewId: string;
    overallScore: number;
    summary: InterviewSummary;
    totalQuestions: number;
    questionsAnswered: number;
    duration: number;
    encouragement: string;
}> => {
    const response = await axios.post(`${BASE_URL}/complete`, {
        interviewId
    });
    return response.data.data;
};

/**
 * Get user's mock interview history
 */
export const getUserInterviewHistory = async (
    userId: string,
    status?: string,
    targetRole?: string
): Promise<any[]> => {
    const params: any = {};
    if (status) params.status = status;
    if (targetRole) params.targetRole = targetRole;

    const response = await axios.get(`${BASE_URL}/history/${userId}`, { params });
    return response.data.data;
};

/**
 * Get detailed interview results
 */
export const getInterviewResults = async (
    interviewId: string
): Promise<{
    interview: any;
    detailedResults: Array<{
        question: any;
        response: any;
        feedback: any;
    }>;
}> => {
    const response = await axios.get(`${BASE_URL}/results/${interviewId}`);
    return response.data.data;
};

/**
 * Get next question in the interview
 */
export const getNextQuestion = async (
    interviewId: string
): Promise<{
    completed: boolean;
    message?: string;
    questionNumber?: number;
    totalQuestions?: number;
    question?: InterviewQuestion;
}> => {
    const response = await axios.get(`${BASE_URL}/next-question/${interviewId}`);
    return response.data.data;
};

const mockInterviewService = {
    startMockInterview,
    submitInterviewAnswer,
    completeMockInterview,
    getUserInterviewHistory,
    getInterviewResults,
    getNextQuestion
};

export default mockInterviewService;
