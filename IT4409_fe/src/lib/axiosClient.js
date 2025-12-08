import axios from "axios";

export const api = axios.create({
    baseURL: "/api",
});

api.interceptors.request.use((config) => {
    const session = localStorage.getItem("session");

    if (session) {
        config.headers["Session"] = session;
    }

    return config;
});
