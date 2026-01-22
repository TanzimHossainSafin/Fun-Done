import axios from "axios";

// Create axios instance with credentials enabled for cookies
export const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true, // Important: enables sending cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // If 401, clear user data and redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Clear user from localStorage
            localStorage.removeItem("udyomix_user");
            // Redirect to login if not already there
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
