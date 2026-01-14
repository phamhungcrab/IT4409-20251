import { useState, useEffect, useCallback } from "react";
import { DataTable } from "../../components/DataTable";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";
import { ConfirmModal } from "../../components/ConfirmModal";
import {
    getAllExamBlueprints,
    createExamBlueprint,
    updateExamBlueprint,
    deleteExamBlueprint,
    getExamBlueprintDetail
} from "../../services/(admin)/ExamBlueprintApi";
import { getAllSubject } from "../../services/(admin)/SubjectApi";
import toast from "react-hot-toast";
import { ChapterInput } from "../../components/ChapterInput";

const CMSExamBlueprint = () => {
    const [blueprints, setBlueprints] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [activeChapters, setActiveChapters] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [blueRes, subRes] = await Promise.all([
                getAllExamBlueprints(),
                getAllSubject()
            ]);
            if (blueRes) setBlueprints(blueRes);
            if (subRes) {
                setSubjects(subRes.map(s => ({
                    value: s.id,
                    label: `${s.subjectCode} - ${s.name}`
                })));
            }
        } catch (error) {
            toast.error("Lỗi khi tải danh sách");
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = async (row = null) => {
        if (row) {
            setLoadingDetail(true);
            const loadToast = toast.loading("Đang tải dữ liệu chi tiết...");
            try {
                const detail = await getExamBlueprintDetail(row.id);
                if (detail) {
                    setEditData(detail);
                    setActiveChapters(detail.chapters || []);
                    setOpen(true);
                }
            } catch (error) {
                toast.error("Không thể lấy thông tin chi tiết");
            } finally {
                setLoadingDetail(false);
                toast.dismiss(loadToast);
            }
        } else {
            setEditData(null);
            setActiveChapters([{ chapter: 1, easyCount: 0, mediumCount: 0, hardCount: 0, veryHardCount: 0 }]);
            setOpen(true);
        }
    };

    const updateChapterData = (index, key, value) => {
        const newChapters = [...activeChapters];
        newChapters[index][key] = value;
        setActiveChapters(newChapters);
    };

    const addChapterRow = () => {
        const nextNum = activeChapters.length > 0 ? Math.max(...activeChapters.map(c => c.chapter)) + 1 : 1;
        setActiveChapters([...activeChapters, { chapter: nextNum, easyCount: 0, mediumCount: 0, hardCount: 0, veryHardCount: 0 }]);
    };

    const handleSave = async (formData) => {
        if (activeChapters.length === 0) return toast.error("Vui lòng thêm ít nhất một chương");

        try {
            const payload = {
                subjectId: Number(formData.subjectId),
                chapters: activeChapters
            };

            if (editData) {
                await updateExamBlueprint(editData.id, payload);
                toast.success("Cập nhật thành công");
            } else {
                await createExamBlueprint(payload);
                toast.success("Tạo cấu trúc mới thành công");
            }
            setOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Thao tác thất bại");
        }
    };

    const columns = [
        { header: "ID", accessor: "id", render: (r) => <span className="text-slate-400 font-mono">{r.id}</span> },
        {
            header: "Học phần",
            accessor: "subjectId",
            render: (r) => {
                const sub = subjects.find(s => s.value === r.subjectId);
                return <span className="font-bold text-slate-700">{sub ? sub.label : r.subjectId}</span>;
            }
        },
        { header: "Số chương", accessor: "totalChapters", render: (r) => <span>{r.totalChapters} chương</span> },
        { header: "Tổng câu hỏi", accessor: "totalQuestions", render: (r) => <span className="text-blue-600 font-bold">{r.totalQuestions} câu</span> },
        { header: "Ngày tạo", accessor: "createdAt", render: (r) => <span className="text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý Khung đề thi</h1>
                <CommonButton
                    label="+ Thêm cấu trúc"
                    color="primary"
                    disabled={loadingDetail}
                    onClick={() => handleOpenModal()}
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={blueprints}
                    actions={[
                        { label: "Sửa", color: "indigo", onClick: (row) => handleOpenModal(row) },
                        { label: "Xóa", color: "red", onClick: (row) => setDeleteId(row.id) }
                    ]}
                />
            </div>

            <Modal
                isOpen={open}
                onClose={() => setOpen(false)}
                title={editData ? `Chỉnh sửa cấu trúc #${editData.id}` : "Tạo cấu trúc đề mới"}
            >
                <Form
                    fields={[{ name: "subjectId", label: "Chọn học phần", type: "select", options: subjects }]}
                    initialValues={editData ? { subjectId: editData.subjectId } : { subjectId: "" }}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                >
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Cấu trúc chi tiết</h3>
                            <button
                                type="button"
                                onClick={addChapterRow}
                                className="text-xs bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-bold transition-all shadow-sm"
                            >
                                + Thêm chương mới
                            </button>
                        </div>

                        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {activeChapters.map((ch, idx) => (
                                <ChapterInput
                                    key={idx}
                                    chapterData={ch}
                                    onChange={(key, val) => updateChapterData(idx, key, val)}
                                    onRemove={() => setActiveChapters(activeChapters.filter((_, i) => i !== idx))}
                                />
                            ))}
                            {activeChapters.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed rounded-2xl border-slate-100 bg-slate-50">
                                    <p className="text-slate-400 text-sm">Chưa có dữ liệu chương. Vui lòng bấm thêm mới.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Form>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Xác nhận xóa"
                message="Dữ liệu này sẽ biến mất vĩnh viễn. Bạn có chắc chắn không?"
                onConfirm={async () => {
                    await deleteExamBlueprint(deleteId);
                    fetchData();
                    setDeleteId(null);
                    toast.success("Đã xóa thành công");
                }}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};

export default CMSExamBlueprint;