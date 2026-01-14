import { api } from "../../lib/axiosClient";

export const uploadManyQuestions = async (jsonData, fileName = "questions.json") => {
    try {
        const blob = new Blob([JSON.stringify(jsonData)], {
            type: "application/json"
        });

        const formData = new FormData();

        formData.append("file", blob, fileName);

        const res = await api.post(`/Question/import-question`, formData);

        return res.data;
    } catch (e) {
        console.error(e);
        return;
    }
}

export const getAllQuestions = async () => {
    try {
        const res = await api.get("/Question/get-all");

        return res.data;
    } catch (e) {
        console.error(e);
        return;
    }
}

export const searchQuestionsForAdmin = async (params) => {
    try {
        const response = await api.post("/Question/search-for-admin", params);
        console.log("questions: ", response.data);
        return response.data;
    } catch (e) {
        console.error("Lỗi khi tìm kiếm bài kiểm tra:", e);
        return null;
    }
};

export const createQuestion = async (credentials) => {
    try {
        const res = await api.post("/Question/create-question", {
            content: credentials.content,
            answer: credentials.answer,
            point: credentials.point,
            difficulty: credentials.difficulty,
            type: credentials.type,
            subjectId: credentials.subjectId
        });

        return res.data;
    } catch (e) {
        console.error(e);
        return;
    }
}

export const updateQuestion = async (credentials, questionId) => {
    try {
        const res = await api.put("/Question/update-question", {
            id: questionId,
            content: credentials.content,
            answer: credentials.answer,
            point: credentials.point,
            difficulty: credentials.difficulty,
            type: credentials.type,
            subjectId: credentials.subjectId
        });

        return res.data;
    } catch (e) {
        console.error(e);
        return;
    }
}

export const deleteQuestion = async (questionId) => {
    try {
        const res = await api.delete(`/Question`,
            { params: { questionId } }
        );
        return res;
    } catch (e) {
        alert("Khong the xoa cau hoi")
        console.error(e);
        return;
    }
}