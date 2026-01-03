// Quản lý bài kiểm tra

import { useState, useEffect } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { DataTable } from "../../components/DataTable";
import { ExamCard } from "../../components/Card";
import { useNavigate } from "react-router-dom";
import { createExam, generateExam, getAllExams } from "../../services/(admin)/ExamApi";
import { getAllClasses } from "../../services/(admin)/ClassApi";
import { getAllExamBlueprints } from "../../services/(admin)/ExamBlueprintApi";
import { ConfirmModal } from "../../components/ConfirmModal";


const CMSExam = () => {

    const [exams, setExams] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [classes, setClasses] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    // const [selectedExamId, setSelectedExamId] = useState(null);
    const [blueprints, setBlueprints] = useState([]);

    const navigate = useNavigate();

    const fetchAllExams = async () => {
        try {
            const examRes = await getAllExams();
            setExams(examRes);

            const classRes = await getAllClasses();
            const classOptions = classRes.data.map(t => ({
                value: t.id,
                label: t.name
            }));
            setClasses(classOptions);

            const blueprintRes = await getAllExamBlueprints();
            const blueprintOptions = blueprintRes.map(t => ({
                value: t.id,
                label: t.id
            }));
            setBlueprints(blueprintOptions);
        } catch (e) {
            console.error("Lỗi tải dữ liệu", e);
        }
    }

    useEffect(() => {
        fetchAllExams();
    }, []);


    const examFields = [
        { name: "name", label: "Tên bài kiểm tra", type: "text" },
        {
            name: "classId", label: "Lớp", type: "select", options: classes
        },
        { name: "examBlueprint", label: "Mã template", type: "select", options: blueprints },
        {
            name: "durationMinutes", label: "Thời gian làm bài", type: "number"
        },
        { name: "startTime", label: "Thời gian bắt đầu", type: "date" },
        { name: "endTime", label: "Thời gian kết thúc", type: "date" }
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
        const res = await deleteExam(deleteId);

        if (res) {
            setClasses(prev => prev.filter(t => t.id !== deleteId))
        }

        setDeleteId(null)
    }

    const handleSave = async (formData) => {
        if (editData) {
            // Update
            const edited = await editExam(editData);
            setExams(exams.map(q =>
                q.id === editData.id ? { ...editData, edited } : q
            ));
        } else {
            // Create
            const created = await createExam(formData);
            setExams([...exams, created]);
        }
        setOpen(false);
    };

    const actions = (exam) => [
        { label: "Xem chi tiết", color: "gray", onClick: () => navigate(`/admin/results/${exam.id}`) },
        { label: "Sửa", color: "gray", onClick: () => handleEdit(exam) },
        { label: "Xóa", color: "red", onClick: () => handleDelete(exam.id) },
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý bài kiểm tra</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm bài kiểm tra..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                    {/* <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white 
                      focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
                      shadow-sm"
                    >
                        <option value="">Học phần</option>
                        <option value="2">IT4409</option>
                        <option value="3">IT4321</option>
                    </select> */}
                </div>

                <CommonButton
                    label="+ Tạo bài kiểm tra"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa bài kiểm tra" : "Thêm bài kiểm tra"}>
                <Form
                    fields={examFields}
                    initialValues={editData || {}}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Xóa bài kiểm tra"
                message="Bạn có chắc chắn muốn xóa bài kiểm tra này? Hành động này không thể hoàn tác."
                confirmLabel="Xóa"
                cancelLabel="Hủy"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />


            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {exams.map(exam => (
                    <ExamCard
                        key={exam.id}
                        title={exam.name}
                        subtitle={`Lớp: ${exam.classId}`}
                        durations={exam.durationMinutes}
                        startTime={exam.startTime}
                        endTime={exam.endTime}
                        actions={actions(exam)}
                    />
                ))}
            </div>

        </div>
    )
}

export default CMSExam;