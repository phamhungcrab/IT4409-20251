import { api } from "../lib/axiosClient";

const getAllClasses = async () => {
    try {
        const classes = await api.get("/Class/get-all");
        console.log("[classapi] Classes: ", classes);
        return classes.data.data;
    } catch (e) {
        console.error("Lấy danh sách lớp học thất bại", e);
        return
    }
}

const getClassesByTeacherSubject = async (teacherId, subjectId) => {
    try {
        const classes = await api.get("/Class/get-by-teacher-and-subject",
            { params: { teacherId, subjectId } }
        );
        return classes.data
    } catch (e) {
        alert("Không tìm thấy lớp học với giáo viên/môn học tương ứng");
        console.error(e);
        return;
    }

}

const addStudentsToClass = async (jsonData, classId, fileName = "students.json") => {
    try {
        const blob = new Blob([JSON.stringify(jsonData)], {
            type: "application/json"
        });

        const formData = new FormData();

        formData.append("file", blob, fileName);

        const res = await api.post(`/Class/add-users/${classId}`, formData);

        return await res.json();
    } catch (e) {
        alert("Thêm danh sách sinh viên vào lớp học thất bại");
        console.error(e);
        return;
    }
}

const createClass = async (credentials) => {
    try {
        const newClass = await api.put(`/Class/create`, {
            name: credentials.name,
            teacherId: credentials.teacherId,
            subjectId: credentials.subjectId
        });
        return newClass.data;
    } catch (e) {
        alert("Tạo lớp học thất bại");
        console.error(e);
        return;
    }
}

const updateClass = async (credentials, classId) => {
    try {
        const editedClass = await api.put(`/Class/update/${classId}`, {
            name: credentials.name,
            teacherId: credentials.teacherId,
            subjectId: credentials.subjectId
        });
        return editedClass.data;
    } catch (e) {
        alert("Sửa thông tin lớp học thất bại");
        console.error(e);
        return;
    }
}

const deleteClass = async (classId) => {
    try {
        const res = await api.delete(`/Class/delete`,
            { params: { classId } }
        );
        return res.data;
    } catch (e) {
        alert("Không thể xóa lớp học");
        console.log(e);
        return;
    }
}

export {
    getAllClasses,
    getClassesByTeacherSubject,
    createClass,
    updateClass,
    deleteClass,
    addStudentsToClass
}