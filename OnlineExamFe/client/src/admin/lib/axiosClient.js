import axios from "axios";

const rawBaseUrl = (import.meta).env?.VITE_API_BASE_URL || "";
const trimmedBaseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const baseUrl = trimmedBaseUrl
    ? (trimmedBaseUrl.endsWith("/api") ? trimmedBaseUrl : `${trimmedBaseUrl}/api`)
    : "/api";

export const api = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") ?? localStorage.getItem("session");

    if (token) {
        config.headers["Session"] = token;
    }

    return config;
});
