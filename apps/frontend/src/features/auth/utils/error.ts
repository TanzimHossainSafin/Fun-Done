import axios from "axios";

export const extractErrorMessage = (
    error: unknown,
    fallback: string
) => {
    if (axios.isAxiosError(error)) {
        const message =
            error.response?.data?.message ||
            error.response?.data?.error;
        if (typeof message === "string") {
            return message;
        }
    }
    return fallback;
};
