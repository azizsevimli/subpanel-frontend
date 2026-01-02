import axios from "axios";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// ✅ Her request'te localStorage token'ı otomatik ekle
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
