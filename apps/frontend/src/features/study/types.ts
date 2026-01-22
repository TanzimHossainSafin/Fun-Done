export type LearningStyle =
    | "visual"
    | "auditory"
    | "kinesthetic"
    | "reading_writing";

export type StudyProfilePayload = {
    userId: string;
    subjects: string[];
    studyTimes?: string[];
    learningStyle?: LearningStyle;
    goals?: string[];
};

export type MatchResult = {
    userId: string;
    score: number;
    breakdown: {
        subjectScore: number;
        goalScore: number;
        timeScore: number;
        styleScore: number;
    };
    overlap: {
        subjects: string[];
        goals: string[];
        studyTimes: string[];
    };
    aiEnhancement?: {
        recommendation: string;
        studyTips: string[];
        suggestedTopics: string[];
        compatibilityInsights: string;
    } | null;
};

export type StudyGroup = {
    _id: string;
    name: string;
    subject: string;
    description: string;
    createdBy: string;
    members: Array<{
        userId: string;
        role: "admin" | "moderator" | "member";
        joinedAt: string;
    }>;
    meetingSuggestions: string[];
    aiModeratorName?: string;
};

export type StudySession = {
    _id: string;
    groupId: string;
    topic: string;
    startedAt: string;
    endedAt?: string;
    durationMinutes?: number;
    createdBy: string;
};
