import { api } from "../../lib/axiosClient";

const getAllExams = async () => {
    try {
        const exams = await api.get("/Exam/get-all");
        console.log("exams: ", exams.data);
        return exams.data;
    } catch (e) {
        alert("Không thể lấy danh sách bài kiểm tra");
        console.error(e);
        return
    }
}

const createExam = async (payload) => {
    try {
        console.log("create exam", {
            name: payload.name,
            classId: Number(payload.classId),
            blueprintId: Number(payload.examBlueprint),
            durationMinutes: Number(payload.durationMinutes),
            startTime: `${payload.startTime}T00:00:00`,
            endTime: `${payload.endTime}T23:59:59`
        })
        const res = await api.post("/Exam/create-exam", {
            name: payload.name,
            classId: Number(payload.classId),
            blueprintId: Number(payload.examBlueprint),
            durationMinutes: Number(payload.durationMinutes),
            startTime: new Date(payload.startTime).toISOString(),
            endTime: new Date(payload.endTime).toISOString()
        });
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