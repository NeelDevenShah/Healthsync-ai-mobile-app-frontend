import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default api = axios.create({
    baseURL: "http://192.168.66.131:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    console.log("token", token);
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Clear local storage and redirect to login
            AsyncStorage.removeItem("authToken");
        }

        return Promise.reject(error);
    }
);