import { api } from "../../lib/axiosClient";

export async function loginApi(credentials) {
    try {
        const res = await api.post("/auth/login", {
            Email: credentials.email,
            Password: credentials.password
        });
        return res.data;
    } catch (error) {
        const msg = error?.response?.data?.message || "Lỗi đăng nhập";
        throw new Error(msg);
    }
}

export async function getProfileApi() {
    try {
        const res = await api.get("/profile");
        return res.data;
    } catch (error) {
        const msg = error?.response?.data?.message || "Lỗi api lấy thông tin người dùng";
        throw new Error(msg);
    }
}
