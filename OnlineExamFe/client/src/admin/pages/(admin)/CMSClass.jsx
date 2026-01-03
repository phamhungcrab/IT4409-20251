//Quản lý lớp học

import { useEffect, useState } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { ExamCard } from "../../components/Card";
import { AddStudentToClassForm } from "../../components/AddStudentToClassForm";
import { createClass, deleteClass, getAllClasses, updateClass } from "../../services/(admin)/ClassApi";
import { getAllUsers } from "../../services/(admin)/UserApi";
import { getAllSubject } from "../../services/(admin)/SubjectApi";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useNavigate } from "react-router-dom";

const CMSClass = () => {

    const [classes, setClasses] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [openMultiple, setOpenMultiple] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null);


    const navigate = useNavigate();

    const fetchAllData = async () => {
        try {
            const classRes = await getAllClasses();
            setClasses(classRes.data);

            const teacherRes = await getAllUsers();

            console.log("teacherRes: ", teacherRes);
            const teacherOptions = teacherRes.data.map(t => ({
                value: t.id,
                label: t.fullName,
            }));
            setTeachers(teacherOptions);

            const subjectRes = await getAllSubject();
            const subjectOptions = subjectRes.map(s => ({
                value: s.id,
                label: s.subjectCode + ' - ' + s.name,
            }));
            setSubjects(subjectOptions);

        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);


    const classFields = [
        { name: "name", label: "Tên lớp học", type: "text" },
        {
            name: "subjectId",
            label: "Mã học phần",
            type: "select",
            options: subjects
        },
        {
            name: "teacherId",
            label: "Giảng viên",
            type: "select",
            options: teachers
        }
    ];


    const handleAdd = () => {
        setEditData(null);
        setOpen(true);
    };

    const handleEdit = (row) => {
        setEditData(row);
        setOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        const res = await deleteClass(deleteId);

        if (res) {
            setClasses(prev => prev.filter(c => c.id !== deleteId));
        }


        setDeleteId(null);
    };

    const handleSave = async (formData) => {
        if (editData) {
            // Update
            const updated = await updateClass(formData, editData.id);
            setClasses(prev =>
                prev.map(c => c.id === updated.id ? updated : c)
            );

        } else {
            // Create
            const created = await createClass(formData);
            setClasses([...classes, created]);
        }
        setOpen(false);
    };

    const actions = (classroom) => [
        { label: "Xem chi tiết", color: "gray", onClick: () => navigate(`/admin/class/${classroom.id}`) },
        { label: "Sửa", color: "gray", onClick: () => handleEdit(classroom) },
        { label: "Thêm sinh viên", color: "gray", onClick: () => { setSelectedClassId(classroom.id); setOpenMultiple(true) } },
        { label: "Xóa", color: "red", onClick: () => handleDelete(classroom.id) },
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý lớp học</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm lớp học..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                        <option value="">Học phần</option>
                        {subjects.map((s) => {
                            return <option value={s.value} key={s.value}>{s.label}</option>
                        })}
                    </select>
                </div>

                <CommonButton
                    label="+ Thêm lớp học"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Xóa lớp học"
                message="Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác."
                confirmLabel="Xóa"
                cancelLabel="Hủy"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa lớp học" : "Thêm lớp học"}>
                <Form
                    fields={classFields}
                    initialValues={editData || {}}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={openMultiple}
                onClose={() => setOpenMultiple(false)}
                title="Thêm nhiều tài khoản"
            >
                <AddStudentToClassForm
                    onSuccess={() => {
                        setOpenMultiple(false);
                    }}
                    classId={selectedClassId}
                />
            </Modal>

            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {classes.map(classroom => (
                    <ExamCard
                        key={classroom.id}
                        title={classroom.name}
                        subtitle={`${classroom.subjectId} - ${classroom.teacherId}`}
                        actions={actions(classroom)}
                        onClick={() => navigate(`/admin/class/${classroom.id}`)}
                    />
                ))}
            </div>

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {classes.length > 0 ? `1–${classes.length}` : "0"} trong {classes.length} lớp học</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Trước</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>
        </div>
    )
}

export default CMSClass