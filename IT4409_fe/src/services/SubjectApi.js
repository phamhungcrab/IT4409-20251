import { api } from "../lib/axiosClient";

async function getAllSubject() {
    try {
        const res = await api.get("/subject/get-all");
        return res.data
    } catch (e) {
        console.alert(e);
        return;
    }
}

async function getSubjectByCode(code) {
    try {
        const res = await api.get(`/subject/get-with-${code}`);
        return res.data;
    } catch (e) {
        console.alert(e);
        return;
    }
}

async function createSubject(credentials) {
    try {
        const newSubject = await api.post("/subject/create", {
            name: credentials.name,
            subjectCode: credentials.subjectCode,
            sub
        })
    } catch (e) {

    }
}

export {
    getAllSubject,
    getSubjectByCode
}