import { api } from "../lib/axiosClient";

const getAllSubject = async () => {
    try {
        const res = await api.get("/Subject/get-all");
        return res.data;
    } catch (e) {
        alert("Không thể lấy danh sách học phần!\n", e);
        return;
    }
}

const getSubjectByCode = async (code) => {
    try {
        const res = await api.get(`/Subject/get-with-${code}`);
        return res.data.data;
    } catch (e) {
        alert(`Không tìm thấy học phần mã ${code}\n`, e);
        return;
    }
}

const createSubject = async (credentials) => {
    try {
        const newSubject = await api.post("/Subject/create", {
            name: credentials.name,
            subjectCode: credentials.subjectCode,
            totalChapters: credentials.totalChapters
        });
        return newSubject.data;
    } catch (e) {
        alert("Không thể tạo mới học phần!\n", e);
        return;
    }
}

const editSubject = async (subjectId, credentials) => {
    try {
        const editedSubject = await api.put(`/Subject/update/${subjectId}`, {
            name: credentials.name,
            subjectCode: credentials.subjectCode,
            totalChapters: credentials.totalChapters
        });
        return editedSubject.data;
    } catch (e) {
        alert(`Không thể sửa học phần ${credentials.subjectCode}\n`, e);
        return;
    }
}

const deleteSubject = async (subjectId) => {
    try {
        const res = await api.delete(`Subject/delete/${subjectId}`);
        return res;
    } catch (e) {
        alert(`Không thể xóa học phần ${subjectId}\n`, e);
        return;
    }
}

export {
    getAllSubject,
    getSubjectByCode,
    createSubject,
    editSubject,
    deleteSubject
}