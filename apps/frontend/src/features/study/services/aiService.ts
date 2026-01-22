import axios from "axios";

const BASE_URL = "http://localhost:3000/app/v1/study";

export interface AIEnhancement {
    recommendation: string;
    studyTips: string[];
    suggestedTopics: string[];
    compatibilityInsights: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export interface StudyAgenda {
    agenda: string[];
    objectives: string[];
    resources: string[];
}

// Chat with AI Moderator in a study group
export const chatWithAIModerator = async (
    groupId: string,
    message: string,
    userId: string,
    aiProvider: "gemini" | "grok" = "gemini"
): Promise<{ response: string; timestamp: string }> => {
    const result = await axios.post(`${BASE_URL}/groups/${groupId}/ai-chat`, {
        message,
        userId,
        aiProvider,
    });
    return result.data;
};

// Generate study session agenda
export const generateStudyAgenda = async (
    topic: string,
    duration: number,
    memberGoals: string[]
): Promise<StudyAgenda> => {
    const result = await axios.post(`${BASE_URL}/ai/generate-agenda`, {
        topic,
        duration,
        memberGoals,
    });
    return result.data;
};

// Get conversation history
export const getConversationHistory = async (
    groupId: string
): Promise<{ history: ChatMessage[] }> => {
    const result = await axios.get(`${BASE_URL}/groups/${groupId}/ai-chat/history`);
    return result.data;
};

// Clear conversation history
export const clearConversationHistory = async (
    groupId: string
): Promise<{ message: string }> => {
    const result = await axios.delete(`${BASE_URL}/groups/${groupId}/ai-chat/history`);
    return result.data;
};
