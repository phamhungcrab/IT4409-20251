import { useState, useEffect, useCallback } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { ExamCard } from "../../components/Card";
import { useNavigate } from "react-router-dom";
import { createExam, searchExamsForAdmin } from "../../services/(admin)/ExamApi";
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

    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 8,
    });

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
        } else {
            await createExam(formData);
        }
        setOpen(false);
        fetchExams();
    };

    const confirmDelete = async () => {
        const res = await deleteExam(deleteId);
        if (res) fetchExams();
        setDeleteId(null);
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý bài kiểm tra</h1>
                <CommonButton label="+ Tạo bài kiểm tra" color="danger" onClick={() => { setEditData(null); setOpen(true); }} />
            </div>

            <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tìm kiếm tên</label>
                        <input
                            type="text"
                            placeholder="Nhập tên bài kiểm tra..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none"
                            value={filters.name}
                            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bắt đầu (Khoảng)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="datetime-local"
                                className="w-full px-2 py-2 border border-gray-200 rounded text-xs"
                                value={filters.startTimeFrom ? filters.startTimeFrom.substring(0, 16) : ""}
                                onChange={(e) => setFilters(prev => ({ ...prev, startTimeFrom: e.target.value ? new Date(e.target.value).toISOString() : "" }))}
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="datetime-local"
                                className="w-full px-2 py-2 border border-gray-200 rounded text-xs"
                                value={filters.startTimeTo ? filters.startTimeTo.substring(0, 16) : ""}
                                onChange={(e) => setFilters(prev => ({ ...prev, startTimeTo: e.target.value ? new Date(e.target.value).toISOString() : "" }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Kết thúc (Đến)</label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                                value={filters.endTimeTo ? filters.endTimeTo.substring(0, 16) : ""}
                                onChange={(e) => setFilters(prev => ({ ...prev, endTimeTo: e.target.value ? new Date(e.target.value).toISOString() : "" }))}
                            />
                        </div>
                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-all"
                        >
                            Xóa lọc
                        </button>
                    </div>
                </div>
            </div>

            {exams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {exams.map(exam => (
                        <ExamCard
                            key={exam.id}
                            title={exam.name}
                            subtitle={`Lớp: ${classes.find(c => c.value === exam.classId)?.label || exam.classId}`}
                            durations={exam.durationMinutes}
                            startTime={exam.startTime}
                            endTime={exam.endTime}
                            actions={actions(exam)}
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