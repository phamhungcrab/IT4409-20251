import { api } from "../lib/axiosClient";

const getAllSubject = async () => {
    try {
        const res = await api.get("/subject/get-all");
        return res.data
    } catch (e) {
        console.alert(e);
        return;
    }
}

const getSubjectByCode = async (code) => {
    try {
        const res = await api.get(`/subject/get-with-${code}`);
        return res.data;
    } catch (e) {
        console.alert(e);
        return;
    }
}

const createSubject = async (credentials) => {
    try {
        const newSubject = await api.post("/subject/create", {
            name: credentials.name,
            subjectCode: credentials.subjectCode,
        });
        return newSubject.data;
    } catch (e) {
        console.alert(e);
        return
    }
}

export {
    getAllSubject,
    getSubjectByCode,
    createSubject
}