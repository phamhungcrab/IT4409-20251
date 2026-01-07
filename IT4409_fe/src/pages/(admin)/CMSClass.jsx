// Quản lý lớp học
import { useEffect, useState, useCallback } from "react"; // Thêm useCallback
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { ExamCard } from "../../components/Card";
import { AddStudentToClassForm } from "../../components/AddStudentToClassForm";
import { createClass, deleteClass, searchForAdmin, updateClass } from "../../services/(admin)/ClassApi";
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

    const [filters, setFilters] = useState({
        name: "",
        subjectId: "",
        teacherId: "",
    });
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
    });

    const navigate = useNavigate();

    const searchClasses = useCallback(async (currentFilters, currentPagination) => {
        try {
            const payload = {
                pageSize: currentPagination.pageSize,
                pageNumber: currentPagination.pageNumber,
                name: currentFilters.name?.trim() || null,
                teacherId: Number(currentFilters.teacherId) || null,
                subjectId: Number(currentFilters.subjectId) || null,
            };
            const res = await searchForAdmin(payload);
            console.log("Res: ", res);
            setClasses(res.data.users || []);
            setPagination(prev => ({ ...prev }));
        } catch (e) {
            console.error("Lỗi search lớp học:", e);
        }
    }, []);

    const fetchMetaData = async () => {
        try {
            const [teacherRes, subjectRes] = await Promise.all([
                getAllUsers(),
                getAllSubject()
            ]);

            setTeachers(teacherRes.map(t => ({ value: t.id, label: t.fullName })));
            setSubjects(subjectRes.map(s => ({ value: s.id, label: `${s.subjectCode} - ${s.name}` })));
        } catch (e) {
            console.error("Lỗi tải metadata:", e);
        }
    };

    useEffect(() => {
        fetchMetaData();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            searchClasses(filters, pagination);
        }, 400);
        return () => clearTimeout(timeout);
    }, [filters, pagination.pageNumber, pagination.pageSize, searchClasses]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    }, [filters]);

    const classFields = [
        { name: "name", label: "Tên lớp học", type: "text" },
        { name: "subjectId", label: "Mã học phần", type: "select", options: subjects },
        { name: "teacherId", label: "Giảng viên", type: "select", options: teachers }
    ];

    const handleSave = async (formData) => {
        try {
            if (editData) {
                await updateClass(formData, editData.id);
            } else {
                await createClass(formData);
            }
            setOpen(false);
            searchClasses(filters, pagination);
        } catch (error) {
            console.error("Lỗi khi lưu:", error);
        }
    };

    const confirmDelete = async () => {
        const res = await deleteClass(deleteId);
        if (res) {
            searchClasses(filters, pagination);
        }
        setDeleteId(null);
    };

    const actions = (classroom) => [
        { label: "Xem chi tiết", color: "gray", onClick: () => navigate(`/class/${classroom.id}`) },
        { label: "Sửa", color: "gray", onClick: () => { setEditData(classroom); setOpen(true); } },
        { label: "Thêm sinh viên", color: "gray", onClick: () => { setSelectedClassId(classroom.id); setOpenMultiple(true) } },
        { label: "Xóa", color: "red", onClick: () => setDeleteId(classroom.id) },
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
                        value={filters.name}
                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                        value={filters.subjectId}
                        onChange={(e) => setFilters(prev => ({ ...prev, subjectId: e.target.value }))}
                    >
                        <option value="">Tất cả học phần</option>
                        {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                        value={filters.teacherId}
                        onChange={(e) => setFilters(prev => ({ ...prev, teacherId: e.target.value }))}
                    >
                        <option value="">Tất cả giảng viên</option>
                        {teachers.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <CommonButton label="+ Thêm lớp học" color="danger" onClick={() => { setEditData(null); setOpen(true); }} />
            </div>

            {/* Grid Classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {classes.map(classroom => (
                    <ExamCard
                        key={classroom.id}
                        title={classroom.name}
                        subtitle={`${classroom.subjectName || classroom.subjectId} - ${classroom.teacherName || classroom.teacherId}`}
                        actions={actions(classroom)}
                    />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {classes.length} lớp học</p>
                <div className="flex items-center gap-4">
                    <button
                        className="disabled:opacity-30"
                        disabled={pagination.pageNumber === 0}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                    >
                        Trước
                    </button>
                    <span>Trang {pagination.pageNumber + 1}</span>
                    <button
                        className="disabled:opacity-30"
                        disabled={classes.length < pagination.pageSize}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                    >
                        Sau
                    </button>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={!!deleteId}
                title="Xóa lớp học"
                message="Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa lớp học" : "Thêm lớp học"}>
                <Form
                    fields={classFields}
                    initialValues={editData || { name: "", subjectId: "", teacherId: "" }}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <Modal isOpen={openMultiple} onClose={() => setOpenMultiple(false)} title="Thêm sinh viên vào lớp">
                <AddStudentToClassForm
                    onSuccess={() => { setOpenMultiple(false); searchClasses(filters, pagination); }}
                    classId={selectedClassId}
                />
            </Modal>
        </div>
    );
};

export default CMSClass;