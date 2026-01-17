import axios from "axios";
import type {
    StudyProfilePayload,
    MatchResult,
    StudyGroup,
    StudySession,
} from "../types";

const BASE_URL = "http://localhost:3000/app/v1/study";

export const saveStudyProfile = async (payload: StudyProfilePayload) => {
    const result = await axios.post(`${BASE_URL}/profile`, payload);
    return result.data;
};

export const fetchStudyProfile = async (userId: string) => {
    const result = await axios.get(`${BASE_URL}/profile/${userId}`);
    return result.data;
};

export const fetchMatches = async (userId: string, limit = 5) => {
    const result = await axios.get(`${BASE_URL}/match/${userId}`, {
        params: { limit },
    });
    return result.data as {
        matches: MatchResult[];
        meetingSuggestions: string[];
    };
};

export const createStudyGroup = async (payload: {
    name: string;
    subject: string;
    description: string;
    createdBy: string;
    memberIds?: string[];
    aiModeratorName?: string;
}) => {
    const result = await axios.post(`${BASE_URL}/groups`, payload);
    return result.data as { group: StudyGroup };
};

export const fetchStudyGroups = async (userId?: string) => {
    const result = await axios.get(`${BASE_URL}/groups`, {
        params: userId ? { userId } : {},
    });
    return result.data as { groups: StudyGroup[] };
};

export const joinStudyGroup = async (groupId: string, userId: string) => {
    const result = await axios.post(`${BASE_URL}/groups/${groupId}/join`, {
        userId,
    });
    return result.data as { group: StudyGroup };
};

export const joinStudyGroupByName = async (
    groupName: string,
    userId: string
) => {
    const result = await axios.post(`${BASE_URL}/groups/join-by-name`, {
        groupName,
        userId,
    });
    return result.data as { group: StudyGroup };
};

export const searchGroups = async (query: string) => {
    const result = await axios.get(`${BASE_URL}/groups/search`, {
        params: { query },
    });
    return result.data as { groups: StudyGroup[] };
};

export const createStudySession = async (
    groupId: string,
    payload: {
        topic: string;
        startedAt: string;
        endedAt?: string;
        createdBy: string;
    }
) => {
    const result = await axios.post(
        `${BASE_URL}/groups/${groupId}/sessions`,
        payload
    );
    return result.data as { session: StudySession };
};

export const fetchStudySessions = async (groupId: string) => {
    const result = await axios.get(
        `${BASE_URL}/groups/${groupId}/sessions`
    );
    return result.data as { sessions: StudySession[] };
};
