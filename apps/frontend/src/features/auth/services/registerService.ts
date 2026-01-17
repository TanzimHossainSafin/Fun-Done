import axios from "axios";

const BASE_URL = "http://localhost:3000/app/v1/users";

export const registerUser = async (payload: {
    username: string;
    email: string;
    password: string;
}) => {
    const result = await axios.post(`${BASE_URL}/register`, payload);
    return result.data as {
        message: string;
        user: { id: string; username: string; email: string };
    };
};
