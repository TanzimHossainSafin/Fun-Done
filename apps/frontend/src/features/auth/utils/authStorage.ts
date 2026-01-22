export type AuthUser = {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
};

const USER_KEY = "udyomix_user";
const USER_ID_KEY = "udyomix_user_id"; // Tab-specific user ID for chat

// Token is now stored in httpOnly cookie, not accessible via JavaScript
// This is more secure as it prevents XSS attacks

export const setUser = (user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also store user ID in sessionStorage (tab-specific) for accurate message ownership
    sessionStorage.setItem(USER_ID_KEY, user.id);
};

export const getUser = (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw) as AuthUser;
    } catch (error) {
        return null;
    }
};

export const clearToken = async () => {
    // Clear user from localStorage
    localStorage.removeItem(USER_KEY);
    // Clear tab-specific user ID from sessionStorage
    sessionStorage.removeItem(USER_ID_KEY);
    
    // Clear httpOnly cookie by calling logout endpoint
    try {
        const apiClient = (await import("../../../utils/axios")).default;
        await apiClient.post("/app/v1/users/logout");
    } catch (error) {
        console.error("Error clearing cookie:", error);
    }
};

// Get tab-specific user ID from sessionStorage (for accurate message ownership in multi-tab scenarios)
export const getTabUserId = (): string | null => {
    return sessionStorage.getItem(USER_ID_KEY);
};
