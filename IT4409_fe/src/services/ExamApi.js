import { api } from "../lib/axiosClient";

const getAllExams = async () => {
    try {
        const exams = await api.get("/Exam/get-all");
        return exams.data;
    } catch (e) {
        alert("Không thể lấy danh sách bài kiểm tra");
        console.error(e);
        return
    }
}

const createExam = async (payload) => {
    try {
        const res = await api.post("/Exam/create-exam", payload);
        return res.data;
    } catch (e) {
        alert("Tạo bài kiểm tra thất bại");
        console.error(e);
        return null;
    }
};

const generateExam = async (payload) => {
    try {
        const res = await api.post("/Exam/generate", payload);
        return res.data;
    } catch (e) {
        alert("Không thể generate đề thi");
        console.error(e);
        return null;
    }
};

const createExamBlueprint = async (payload) => {
    try {
        const res = await api.post("/ExamBlueprint/create", payload);
        return res.data;
    } catch (e) {
        alert("Tạo blueprint thất bại");
        console.error(e);
        return null;
    }
};

export {
    getAllExams,
    createExam,
    generateExam,
    createExamBlueprint
}