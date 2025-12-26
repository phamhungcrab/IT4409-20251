import { api } from "../lib/axiosClient";

const getAllUsers = async () => {
    try {
        const users = await api.get("/User/get-all");
        console.log("User data (api): ", users.data.data);
        return users.data;
    } catch (e) {
        alert("Lấy danh sách người dùng thất bại");
        return;
    }
}

const uploadUsersJson = async (jsonData, fileName = "users.json") => {
    try {
        const blob = new Blob([JSON.stringify(jsonData)], {
            type: "application/json",
        });

        const formData = new FormData();

        formData.append("file", blob, fileName);

        const res = await api.post("/User/create-users", formData);

        if (!res.o) throw new Error("Lỗi API");

        return await res.data;
    } catch (e) {
        alert("Thêm danh sách người dùng mới thất bại");
        return;
    }
}

const createSingleUser = async (credentials) => {
    try {
        const user = await api.post("/User/create", {
            fullName: credentials.fullName,
            dateOfBirth: credentials.dateOfBirth,
            mssv: credentials.mssv,
            email: credentials.email,
            password: credentials.password,
            role: credentials.role
        });

        return user.data;
    } catch (e) {
        alert("Thêm người dùng thất bại");
        return;
    }
}

const editUser = async (credentials) => {
    try {
        const editedUser = await api.put("/User/update", {
            fullName: credentials.fullName,
            dateOfBirth: credentials.dateOfBirth,
            mssv: credentials.mssv,
            email: credentials.email,
            password: credentials.password,
            role: credentials.role
        });

        return editedUser.data;
    } catch (e) {
        alert("Sửa thông tin người dùng thất bại");
        return;
    }
}

const deleteUser = async (userId) => {
    try {
        const res = await api.delete(`/User/delete?userId=${userId}`);
        return res;
    } catch (e) {
        alert("Không thể xóa người dùng");
        return;
    }
}

export {
    getAllUsers,
    uploadUsersJson,
    createSingleUser,
    editUser,
    deleteUser
}