import { useEffect, useState, useCallback } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { ExamCard } from "../../components/Card";
import { AddStudentToClassForm } from "../../components/AddStudentToClassForm";
import { createClass, deleteClass, searchForAdmin, updateClass } from "../../services/(admin)/ClassApi";
import { searchUsersForAdmin } from "../../services/(admin)/UserApi";
import { getAllSubject } from "../../services/(admin)/SubjectApi";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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

    const searchClasses = useCallback(async () => {
        try {
            const payload = {
                pageSize: pagination.pageSize,
                pageNumber: pagination.pageNumber,
                name: filters.name?.trim() || null,
                teacherId: Number(filters.teacherId) || null,
                subjectId: Number(filters.subjectId) || null,
            };
            const res = await searchForAdmin(payload);
            if (res && res.data) {
                setClasses(res.data.users || []);
            }
        } catch (e) {
            console.error("Lỗi search lớp học:", e);
        }
    }, [filters, pagination]);

    const fetchMetaData = async () => {
        try {
            const [teacherRes, subjectRes] = await Promise.all([
                searchUsersForAdmin({ role: "TEACHER", pageSize: 1000 }),
                getAllSubject()
            ]);

            if (teacherRes?.data?.users) {
                setTeachers(teacherRes.data.users.map(t => ({ value: t.id, label: t.fullName })));
            }
            if (subjectRes) {
                setSubjects(subjectRes.map(s => ({ value: s.id, label: `${s.subjectCode} - ${s.name}` })));
            }
        } catch (e) {
            console.error("Lỗi tải metadata:", e);
        }
    };

    useEffect(() => {
        fetchMetaData();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            searchClasses();
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchClasses]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    }, [filters]);

    const handleResetFilters = () => {
        setFilters({ name: "", subjectId: "", teacherId: "" });
    };

    const handleSave = async (formData) => {
        try {
            if (editData) {
                await updateClass(formData, editData.id);
                toast.success("Cập nhật lớp học thành công");
            } else {
                await createClass(formData);
                toast.success("Tạo lớp học mới thành công");
            }
            setOpen(false);
            searchClasses();
        } catch (error) {
            toast.error("Thao tác thất bại");
        }
    };

    const confirmDelete = async () => {
        try {
            const res = await deleteClass(deleteId);
            if (res) {
                toast.success("Đã xóa lớp học");
                searchClasses();
            }
        } catch (error) {
            toast.error("Không thể xóa lớp học");
        }
        setDeleteId(null);
    };

    const classFields = [
        { name: "name", label: "Tên lớp học", type: "text" },
        { name: "subjectId", label: "Mã học phần", type: "select", options: subjects },
        { name: "teacherId", label: "Giảng viên", type: "select", options: teachers }
    ];

    const actions = (classroom) => [
        { label: "Xem chi tiết", color: "gray", onClick: () => navigate(`/class/${classroom.id}`) },
        { label: "Sửa", color: "gray", onClick: () => { setEditData(classroom); setOpen(true); } },
        { label: "Thêm sinh viên", color: "gray", onClick: () => { setSelectedClassId(classroom.id); setOpenMultiple(true) } },
        { label: "Xóa", color: "red", onClick: () => setDeleteId(classroom.id) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý Lớp học</h1>
                <CommonButton label="+ Thêm lớp học" color="danger" onClick={() => { setEditData(null); setOpen(true); }} />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap lg:flex-nowrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Tên lớp học</label>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 transition-all"
                        value={filters.name}
                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    />
                </div>

                <div className="flex-1 min-w-[180px]">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Học phần</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-red-400"
                        value={filters.subjectId}
                        onChange={(e) => setFilters(prev => ({ ...prev, subjectId: e.target.value }))}
                    >
                        <option value="">Tất cả học phần</option>
                        {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[180px]">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Giảng viên</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-red-400"
                        value={filters.teacherId}
                        onChange={(e) => setFilters(prev => ({ ...prev, teacherId: e.target.value }))}
                    >
                        <option value="">Tất cả giảng viên</option>
                        {teachers.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>

                <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-sm font-bold border border-gray-200 transition-all h-[38px] whitespace-nowrap"
                >
                    Xóa bộ lọc
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {classes.map(classroom => (
                    <ExamCard
                        key={classroom.id}
                        title={classroom.name}
                        subtitle={
                            <div className="flex flex-col gap-1">
                                <span>{classroom.subject?.subjectCode || "N/A"}</span>
                                <span>GV: {classroom.teacher?.fullName || "Chưa phân công"}</span>
                            </div>
                        }
                        actions={actions(classroom)}
                        onClick={() => navigate(`/class/${classroom.id}`)}
                    />
                ))}
            </div>

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <p>Hiển thị <b>{classes.length}</b> lớp học</p>
                <div className="flex items-center gap-4">
                    <button
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-30 transition-all"
                        disabled={pagination.pageNumber === 1}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                    >
                        Trước
                    </button>
                    <span className="font-bold">Trang {pagination.pageNumber}</span>
                    <button
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-30 transition-all"
                        disabled={classes.length < pagination.pageSize}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                    >
                        Sau
                    </button>
                </div>
            </div>

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
                    initialValues={editData ? {
                        name: editData.name,
                        subjectId: editData.subjectId,
                        teacherId: editData.teacherId
                    } : { name: "", subjectId: "", teacherId: "" }}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <Modal isOpen={openMultiple} onClose={() => setOpenMultiple(false)} title="Thêm sinh viên vào lớp">
                <AddStudentToClassForm
                    onSuccess={() => { setOpenMultiple(false); searchClasses(); }}
                    classId={selectedClassId}
                />
            </Modal>
        </div>
    );
};

export default CMSClass;