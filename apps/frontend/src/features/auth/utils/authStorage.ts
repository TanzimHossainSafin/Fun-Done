export type AuthUser = {
    id: string;
    username: string;
    email: string;
};

const TOKEN_KEY = "bondhon_token";
const USER_KEY = "bondhon_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const setUser = (user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
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

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};
