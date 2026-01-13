import { api } from "../../lib/axiosClient";
import toast from "react-hot-toast";

const getAllClasses = async () => {
    try {
        const classes = await api.get("/Class/get-all");
        console.log("[classapi] Classes: ", classes);
        return classes.data;
    } catch (e) {
        console.error("Lấy danh sách lớp học thất bại", e);
        return
    }
}

const searchForAdmin = async (params) => {
    try {
        console.log("Params search classes: ", params)
        const classes = await api.post("/Class/search-for-admin", params);
        return classes.data;
    } catch (e) {
        console.error("Tìm kiếm lớp học thất bại", e);
        return null;
    }
}

const getClassesByTeacherSubject = async (teacherId, subjectId) => {
    try {
        const classes = await api.get("/Class/get-by-teacher-and-subject",
            { params: { teacherId, subjectId } }
        );
        return classes.data;
    } catch (e) {
        alert("Không tìm thấy lớp học với giáo viên/môn học tương ứng");
        console.error(e);
        return;
    }

}

const addStudentsToClass = async (jsonData, classId, fileName = "test.json") => {
    try {
        console.log("Json data: ", JSON.stringify(jsonData));
        const blob = new Blob([JSON.stringify(jsonData)], {
            type: "application/json"
        });

        console.log("formData", jsonData);

        const formData = new FormData();

        formData.append("file", blob, fileName);

        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ', pair[1]);
        }

        const fileInForm = formData.get("file");
        const reader = new FileReader();
        reader.onload = function (e) {
            console.log("Nội dung file thực tế gửi đi:", e.target.result);
        };
        reader.readAsText(fileInForm);

        const res = await api.post(`/Class/add-users/${classId}`, formData);

        return await res.data;
    } catch (e) {
        toast.me
        console.error(e);
        return;
    }
}

const createClass = async (credentials) => {
    try {
        const newClass = await api.post(`/Class/create`, {
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
        console.error(e);
        return;
    }
}

const getStudentsOfClass = async (classId) => {
    try {
        const res = await api.get(`/Class/get-students`,
            { params: { classId } }
        )
        console.log("student of class: ", res.data);
        return res.data;
    } catch (e) {
        alert("Không thế lấy danh sách sinh viên");
        console.error(e);
        return
    }
}

const getClassDetail = async (classId) => {
    try {
        const res = await api.get(`/Class/get-by-id/${classId}`);
        console.log("Class Detail: ", res.data);
        return res.data
    } catch (e) {
        console.error(e);
        return null;
    }
}

const addStudentToClass = async (classId, payload) => {
    try {
        const res = await api.post(`/Class/add-user/${classId}`, {
            email: payload.email,
            mssv: payload.mssv
        });
        return res.data;
    } catch (e) {
        console.error(e);
        return null
    }
}

const removeSingleStudent = async (classId, studentId) => {
    try {
        const res = await api.delete(`/Class/remove-user/${classId}/${studentId}`);
        return res.data;
    } catch (e) {
        console.error(e);
        return;
    }
}

export {
    getAllClasses,
    searchForAdmin,
    getClassesByTeacherSubject,
    createClass,
    updateClass,
    deleteClass,
    addStudentsToClass,
    addStudentToClass,
    getStudentsOfClass,
    getClassDetail,
    removeSingleStudent
}