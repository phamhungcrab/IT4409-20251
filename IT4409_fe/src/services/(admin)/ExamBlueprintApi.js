import { api } from "../../lib/axiosClient";

const getAllExamBlueprints = async () => {
    try {
        const blueprints = await api.get("/ExamBlueprint/get-all");
        console.log("blueprints: ", blueprints.data);
        return blueprints.data;
    } catch (e) {
        alert("Không thể lấy danh sách khung bài kiểm tra");
        console.error(e);
        return
    }
}

export {
    getAllExamBlueprints
}