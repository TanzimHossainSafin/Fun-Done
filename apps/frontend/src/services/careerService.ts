import axios from "axios";

const BASE_URL = "http://localhost:3000/app/v1/career";

export interface SkillRequirement {
    skillName: string;
    percentage: number;
    priority: "essential" | "important" | "nice-to-have";
}

export interface CareerAnalysisResult {
    careerPath: any;
    marketInsights: {
        demand: string;
        growthTrend: string;
        sampleJobTitles: string[];
    };
}

export interface AssessmentQuestion {
    _id: string;
    questionText: string;
    skillCategory: string;
    difficulty: string;
    options?: string[];
    codeChallenge?: {
        prompt: string;
        language: string;
        testCases: Array<{
            input: string;
            expectedOutput: string;
        }>;
    };
}

export interface SkillScore {
    skillName: string;
    score: number;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    questionsAnswered: number;
    questionsCorrect: number;
}

export interface Resource {
    title: string;
    url: string;
    type: "video" | "article" | "course" | "book" | "exercise";
    platform: string;
    duration: string;
    isFree: boolean;
    difficulty: string;
}

export interface Milestone {
    weekNumber: number;
    title: string;
    description: string;
    skillsToLearn: string[];
    resources: Resource[];
    projectIdea: string;
    estimatedHours: number;
    completed: boolean;
    completedAt?: Date;
    certificate?: {
        earned: boolean;
        url?: string;
        earnedAt?: Date;
    };
}

/**
 * Analyze career path for a target role
 */
export const analyzeCareerPath = async (
    userId: string,
    targetRole: string,
    industry?: string
): Promise<CareerAnalysisResult> => {
    const response = await axios.post(`${BASE_URL}/analyze`, {
        userId,
        targetRole,
        industry
    });
    return response.data.data;
};

/**
 * Create skill assessment
 */
export const createSkillAssessment = async (
    userId: string,
    targetRole: string,
    careerPathId?: string
): Promise<{ assessmentId: string; questions: AssessmentQuestion[]; totalQuestions: number }> => {
    const response = await axios.post(`${BASE_URL}/assessment/create`, {
        userId,
        targetRole,
        careerPathId
    });
    return response.data.data;
};

/**
 * Submit answer to assessment question
 */
export const submitAssessmentAnswer = async (
    assessmentId: string,
    questionId: string,
    userAnswer: string,
    timeTaken: number,
    codeSubmitted?: string
): Promise<{ isCorrect: boolean; correctAnswer: string; explanation: string }> => {
    const response = await axios.post(`${BASE_URL}/assessment/answer`, {
        assessmentId,
        questionId,
        userAnswer,
        timeTaken,
        codeSubmitted
    });
    return response.data.data;
};

/**
 * Complete assessment and get results
 */
export const completeSkillAssessment = async (
    assessmentId: string
): Promise<{
    assessmentId: string;
    overallScore: number;
    skillScores: SkillScore[];
    totalQuestions: number;
    correctAnswers: number;
    duration: number;
}> => {
    const response = await axios.post(`${BASE_URL}/assessment/complete`, {
        assessmentId
    });
    return response.data.data;
};

/**
 * Generate personalized learning path
 */
export const generateLearningPath = async (
    userId: string,
    assessmentId: string
): Promise<{
    learningPath: any;
    gapAnalysis: {
        strengths: string[];
        criticalGaps: string[];
        readinessScore: number;
    };
}> => {
    const response = await axios.post(`${BASE_URL}/learning-path/generate`, {
        userId,
        assessmentId
    });
    return response.data.data;
};

/**
 * Update milestone progress
 */
export const updateMilestoneProgress = async (
    learningPathId: string,
    weekNumber: number,
    completed: boolean,
    certificateUrl?: string
): Promise<{ learningPath: any; progress: number }> => {
    const response = await axios.post(`${BASE_URL}/learning-path/progress`, {
        learningPathId,
        weekNumber,
        completed,
        certificateUrl
    });
    return response.data.data;
};

/**
 * Get user's learning paths
 */
export const getUserLearningPaths = async (userId: string): Promise<any[]> => {
    const response = await axios.get(`${BASE_URL}/learning-path/${userId}`);
    return response.data.data;
};

const careerService = {
    analyzeCareerPath,
    createSkillAssessment,
    submitAssessmentAnswer,
    completeSkillAssessment,
    generateLearningPath,
    updateMilestoneProgress,
    getUserLearningPaths
};

export default careerService;
