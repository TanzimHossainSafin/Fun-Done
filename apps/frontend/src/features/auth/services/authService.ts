import apiClient from "../../../utils/axios";

const BASE_URL = "/app/v1/users";

export const loginUser = async (payload: {
    email: string;
    password: string;
}) => {
    const result = await apiClient.post(`${BASE_URL}/login`, payload);
    return result.data as {
        message: string;
        user: { id: string; username: string; email: string; profileImage?: string };
    };
};
