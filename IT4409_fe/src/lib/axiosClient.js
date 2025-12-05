import axios from "axios";

const authRequestInterceptor = (config) => {
    if (config.headers) {
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }

    return config;
};

export const api = axios.create({
    baseURL: "/api"
});

api.interceptors.request.use(authRequestInterceptor);