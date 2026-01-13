import { api } from "../../lib/axiosClient";
import toast from "react-hot-toast";

const getAllExamBlueprints = async () => {
    try {
        const blueprints = await api.get("/ExamBlueprint/get-all");
        console.log("blueprints: ", blueprints.data);
        return blueprints.data;
    } catch (e) {
        //alert("Không thể lấy danh sách khung bài kiểm tra");
        console.error(e);
        return
    }
}

const createExamBlueprint = async (data) => {
    try {
        const res = await api.post("/ExamBlueprint/create", data);
        //toast.success("Tạo khung bài kiểm tra thành công!");
        return res.data;
    } catch (e) {
        console.error("Lỗi tạo khung:", e);
        //toast.error("Tạo khung bài kiểm tra thất bại");
        return null;
    }
};

const updateExamBlueprint = async (id, data) => {
    try {
        const res = await api.put(`/ExamBlueprint/update/${id}`, data);
        //toast.success("Cập nhật khung bài kiểm tra thành công!");
        return res.data;
    } catch (e) {
        console.error("Lỗi cập nhật khung:", e);
        //toast.error("Cập nhật khung bài kiểm tra thất bại");
        return null;
    }
};

const deleteExamBlueprint = async (id) => {
    try {
        const res = await api.delete(`/ExamBlueprint/delete/${id}`);
        //toast.success("Xóa khung bài kiểm tra thành công!");
        return res.data;
    } catch (e) {
        console.error("Lỗi xóa khung:", e);
        //toast.error("Xóa khung bài kiểm tra thất bại");
        return null;
    }
};

const getExamBlueprintDetail = async (id) => {
    try {
        const res = await api.get(`/ExamBlueprint/${id}`);
        console.log(res);
        return res.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export {
    getAllExamBlueprints,
    createExamBlueprint,
    updateExamBlueprint,
    deleteExamBlueprint,
    getExamBlueprintDetail
}