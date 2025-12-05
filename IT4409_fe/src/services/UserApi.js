import { api } from "../lib/axiosClient";

const getAllUsers = async () => {
    try {
        const users = await api.get("/users/get-all");
        return users.data
    } catch (e) {
        console.alert(e);
        return;
    }
}

export {
    getAllUsers
}