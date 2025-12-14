import axios from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config) => {
    const session = await getSession();

    // Prioritize student token for exam pages
    if (typeof window !== "undefined" && (window.location.pathname.startsWith("/exam-taking") || window.location.pathname.startsWith("/exam-entry"))) {
        const studentToken = sessionStorage.getItem("student_token");
        if (studentToken) {
            config.headers.Authorization = `Bearer ${studentToken}`;
            return config;
        }
    }

    if (session && (session as any).accessToken) {
        config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    } else if (typeof window !== "undefined") {
        const studentToken = sessionStorage.getItem("student_token");
        if (studentToken) {
            config.headers.Authorization = `Bearer ${studentToken}`;
        }
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized
            if (typeof window !== "undefined" && !window.location.pathname.startsWith("/exam-taking") && !window.location.pathname.startsWith("/exam-entry")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export const api = apiClient;
