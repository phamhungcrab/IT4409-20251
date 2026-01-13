import axios from "axios";

export const api = axios.create({
    // baseURL: "/api",
    baseURL: "https://it4409-20251.onrender.com/api",
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const session = localStorage.getItem("session");

    if (session) {
        config.headers["Session"] = session;
    }

    return config;
});
