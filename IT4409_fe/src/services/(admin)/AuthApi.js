import { api } from "../../lib/axiosClient";
import toast from "react-hot-toast";

export async function loginApi(credentials) {
    try {
        const res = await api.post("/Auth/login", {
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

export async function getAbout() {
    try {
        const res = await api.get("/About/about");
        console.log("About: ", res.data);
        return res.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function changePassword(payload) {
    try {
        const res = await api.post("/Auth/change-password", {
            email: payload.email,
            newPassword: payload.newPassword,
            oldPassword: payload.oldPassword
        });
        toast.success("Đổi mật khẩu thành công!");
        return res;
    } catch (e) {
        toast.error("Đổi mật khẩu thất bại. Vui lòng thử lại");
        console.error(e);
        return null;
    }
}
