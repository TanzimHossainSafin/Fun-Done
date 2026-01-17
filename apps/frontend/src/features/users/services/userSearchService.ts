import axios from "axios";

const BASE_URL = "http://localhost:3000/app/v1/users";

export const searchUsers = async (query: string) => {
    const result = await axios.get(`${BASE_URL}/search`, {
        params: { query },
    });
    return result.data as {
        users: Array<{ id: string; username: string; email: string }>;
    };
};
