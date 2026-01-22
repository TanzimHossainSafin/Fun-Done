export interface InterviewQuestion {
    _id: string;
    questionText: string;
    questionType: "technical" | "behavioral" | "situational" | "case-study" | "coding";
    difficulty: "easy" | "medium" | "hard";
    category?: string;
    expectedKeywords?: string[];
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
}

export interface InterviewResponse {
    questionId: string;
    questionText: string;
    userAnswer: string;
    timeTaken: number;
    timestamp: Date;
}

export interface MockInterview {
    _id: string;
    userId: string;
    targetRole: string;
    targetCompany?: string;
    industry?: string;
    interviewType: "technical" | "behavioral" | "mixed" | "case-study";
    questions: InterviewQuestion[];
    responses: InterviewResponse[];
    feedback: any[];
    status: "scheduled" | "in-progress" | "completed" | "abandoned";
    overallScore?: number;
    createdAt: Date;
    completedAt?: Date;
}

export interface InterviewSummary {
    strengths: string[];
    areasToImprove: string[];
    readinessLevel: "not-ready" | "needs-practice" | "ready" | "well-prepared";
    recommendations: string[];
    overallScore: number;
    encouragement: string;
}
