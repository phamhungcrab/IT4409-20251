import { api } from "../../lib/axiosClient";
import toast from "react-hot-toast";

const getAllUsers = async () => {
    try {
        const users = await api.get("/User/get-all");
        console.log("User data (api): ", users.data.data);
        return users.data.data;
    } catch (e) {
        toast.error("Lấy danh sách người dùng thất bại");
        return;
    }
}

const searchUsersForAdmin = async (payload) => {
    try {
        const users = await api.post("/User/search-for-admin", payload);
        console.log("User data searched: ", users.data);
        return users.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

const uploadUsersJson = async (jsonData, fileName = "users.json") => {
    try {
        const blob = new Blob([JSON.stringify(jsonData)], {
            type: "application/json",
        });

        const formData = new FormData();

        formData.append("file", blob, fileName);

        //console.log("formData:", formData);

        const res = await api.post("/User/create-users", formData, {
            headers: {
                "Content-Type": undefined,
            },
        });

        if (!res.o) throw new Error("Lỗi API");

        toast.success("Thêm danh sách người dùng thành công!")
        return await res.data;
    } catch (e) {
        //toast.error("Thêm danh sách người dùng mới thất bại");
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

        toast.success("Thêm người dùng thành công!")
        return user.data;
    } catch (e) {
        //toast.error("Thêm người dùng thất bại");
        return;
    }
}

const editUser = async (credentials) => {
    console.log("edit user: ", credentials);
    try {
        const editedUser = await api.put("/User/update", {
            fullName: credentials.fullName,
            dateOfBirth: credentials.dateOfBirth,
            mssv: credentials.mssv,
            email: credentials.email,
            password: credentials.password,
            role: credentials.role
        });

        toast.success("Sửa thông tin người dùng thành công!")

        return editedUser.data;
    } catch (e) {
        //toast.error("Sửa thông tin người dùng thất bại");
        return;
    }
}

const deleteUser = async (userId) => {
    try {
        const res = await api.delete(`/User/delete?userId=${userId}`);
        return res;
    } catch (e) {
        //toast.error("Không thể xóa người dùng, vui lòng thử lại");
        return;
    }
}

export {
    getAllUsers,
    searchUsersForAdmin,
    uploadUsersJson,
    createSingleUser,
    editUser,
    deleteUser
}