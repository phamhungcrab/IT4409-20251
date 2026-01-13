import { useState, useEffect, useCallback } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { ExamCard } from "../../components/Card";
import { useNavigate } from "react-router-dom";
import { createExam, searchExamsForAdmin, updateExam, deleteExam } from "../../services/(admin)/ExamApi";
import { getAllClasses } from "../../services/(admin)/ClassApi";
import { getAllExamBlueprints } from "../../services/(admin)/ExamBlueprintApi";
import { ConfirmModal } from "../../components/ConfirmModal";

const CMSExam = () => {
    const [exams, setExams] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [classes, setClasses] = useState([]);
    const [blueprints, setBlueprints] = useState([]);
    const [deleteId, setDeleteId] = useState(null);

    const [filters, setFilters] = useState({
        name: "",
        startTimeFrom: "",
        startTimeTo: "",
        endTimeFrom: "",
        endTimeTo: "",
    });

    const handleViewDetail = (id) => {
        navigate(`/results/${id}`);
    };

    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 9,
    });

    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year}`;
    };

    const navigate = useNavigate();

    const fetchExams = useCallback(async () => {
        const payload = {
            pageSize: pagination.pageSize,
            pageNumber: pagination.pageNumber,
            name: filters.name?.trim() || null,
            startTimeFrom: filters.startTimeFrom || null,
            startTimeTo: filters.startTimeTo || null,
            endTimeFrom: filters.endTimeFrom || null,
            endTimeTo: filters.endTimeTo || null,
        };

        const res = await searchExamsForAdmin(payload);
        if (res && res.data) {
            console.log("Res exams: ", res.data.users)
            setExams(res.data.users);
        }
    }, [filters, pagination]);

    const fetchMetaData = async () => {
        try {
            const [classRes, blueprintRes] = await Promise.all([
                getAllClasses(),
                getAllExamBlueprints()
            ]);

            setClasses(classRes.data.map(t => ({ value: t.id, label: t.name })));
            setBlueprints(blueprintRes.map(t => ({ value: t.id, label: `Mẫu: ${t.id}` })));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchMetaData();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchExams();
        }, 400);
        return () => clearTimeout(timeout);
    }, [fetchExams]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    }, [filters]);

    const handleResetFilters = () => {
        setFilters({
            name: "",
            startTimeFrom: "",
            startTimeTo: "",
            endTimeFrom: "",
            endTimeTo: "",
        });
    };

    const handleSave = async (formData) => {
        if (editData) {
            await updateExam(formData, editData.id);
            if (res) toast.success("Cập nhật bài kiểm tra thành công!");
        } else {
            await createExam(formData);
            if (res) toast.success("Tạo bài kiểm tra thành công!");
        }
        setOpen(false);
        fetchExams();
    };

    const confirmDelete = async () => {
        try {
            const res = await deleteExam(deleteId);
            if (res) {
                toast.success("Đã xóa bài kiểm tra thành công!");
                fetchExams();
            }
        } catch (error) {
            toast.error("Lỗi khi xóa bài kiểm tra!");
        } finally {
            setDeleteId(null);
        }
    };

    const getInitialValues = () => {
        if (editData) {
            return {
                ...editData,
                examBlueprint: editData.blueprintId,
                startTime: editData.startTime ? editData.startTime.substring(0, 16) : "",
                endTime: editData.endTime ? editData.endTime.substring(0, 16) : "",
            };
        }
        return { name: "", durationMinutes: 60 };
    };

    const examFields = [
        { name: "name", label: "Tên bài kiểm tra", type: "text" },
        { name: "classId", label: "Lớp học", type: "select", options: classes },
        { name: "examBlueprint", label: "Mẫu đề thi", type: "select", options: blueprints },
        { name: "durationMinutes", label: "Thời gian (phút)", type: "number" },
        { name: "startTime", label: "Bắt đầu", type: "datetime-local" },
        { name: "endTime", label: "Kết thúc", type: "datetime-local" }
    ];

    const actions = (exam) => [
        { label: "Kết quả", color: "gray", onClick: () => navigate(`/results/${exam.id}`) },
        { label: "Sửa", color: "gray", onClick: () => { setEditData(exam); setOpen(true); } },
        { label: "Xóa", color: "red", onClick: () => setDeleteId(exam.id) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý bài kiểm tra</h1>
                <CommonButton label="+ Tạo bài kiểm tra" color="danger" onClick={() => { setEditData(null); setOpen(true); }} />
            </div>

            <div className="mb-8 bg-white p-4 rounded-xl border border-gray-100 flex flex-wrap lg:flex-nowrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tìm kiếm theo tên</label>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 transition-all"
                        value={filters.name}
                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    />
                </div>

                <div className="w-full sm:w-auto flex-1 min-w-[180px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bắt đầu</label>
                    <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400"
                        value={filters.startTimeFrom?.substring(0, 16) || ""}
                        onChange={(e) => setFilters(prev => ({ ...prev, startTimeFrom: e.target.value ? new Date(e.target.value).toISOString() : "" }))}
                    />
                </div>

                <div className="w-full sm:w-auto flex-1 min-w-[180px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kết thúc</label>
                    <input
                        type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400"
                        value={filters.endTimeTo?.substring(0, 16) || ""}
                        onChange={(e) => setFilters(prev => ({ ...prev, endTimeTo: e.target.value ? new Date(e.target.value).toISOString() : "" }))}
                    />
                </div>

                <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-sm font-bold border border-gray-200 transition-all h-[38px] whitespace-nowrap"
                >
                    Xóa bộ lọc
                </button>
            </div>

            {exams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map(exam => (
                        <ExamCard
                            key={exam.id}
                            title={exam.name}
                            subtitle={`${formatDateTime(exam.startTime)} - ${formatDateTime(exam.endTime)}`}
                            durations={exam.durationMinutes}
                            startTime={exam.startTime}
                            endTime={exam.endTime}
                            actions={actions(exam)}
                            onClick={() => handleViewDetail(exam.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400">Không tìm thấy bài kiểm tra nào.</p>
                </div>
            )}

            <div className="mt-8 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <span className="text-sm text-gray-500">
                    Hiển thị <span className="font-semibold text-gray-700">{exams.length}</span> kết quả
                </span>
                <div className="flex gap-2">
                    <button
                        disabled={pagination.pageNumber === 1}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                        className="px-4 py-2 border rounded-md disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                        Trước
                    </button>
                    <div className="flex items-center px-4 font-medium text-sm text-gray-700">Trang {pagination.pageNumber}</div>
                    <button
                        disabled={exams.length < pagination.pageSize}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                        className="px-4 py-2 border rounded-md disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                        Sau
                    </button>
                </div>
            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Chỉnh sửa bài kiểm tra" : "Tạo bài kiểm tra mới"}>
                <Form
                    fields={examFields}
                    initialValues={editData || { name: "", durationMinutes: 60 }}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Xác nhận xóa"
                message="Dữ liệu bài kiểm tra sẽ bị xóa vĩnh viễn."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};

export default CMSExam;