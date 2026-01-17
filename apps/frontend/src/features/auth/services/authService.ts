import axios from "axios";

const BASE_URL = "http://localhost:3000/app/v1/users";

export const loginUser = async (payload: {
    email: string;
    password: string;
}) => {
    const result = await axios.post(`${BASE_URL}/login`, payload);
    return result.data as {
        message: string;
        token: string;
        user: { id: string; username: string; email: string };
    };
};
