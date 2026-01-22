import apiClient from "../../../utils/axios";

const BASE_URL = "/app/v1/users";

export const registerUser = async (payload: {
    username: string;
    email: string;
    password: string;
    profileImage?: string;
}) => {
    const result = await apiClient.post(`${BASE_URL}/register`, payload);
    return result.data as {
        message: string;
        user: { id: string; username: string; email: string; profileImage?: string };
    };
};
