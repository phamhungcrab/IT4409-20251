// Quản lý bài kiểm tra

import { useState } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { DataTable } from "../../components/DataTable";
import { ExamCard } from "../../components/Card";
import { useNavigate } from "react-router-dom";
import { createExam, generateExam, getAllExams } from "../../services/ExamApi";
import { getAllClasses } from "../../services/ClassApi";


export const CMSExam = () => {

    const [exams, setExams] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [classes, setClasses] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [selectedExamId, setSelectedExamId] = useState(null);

    const navigate = useNavigate();

    const fetchAllExams = async () => {
        try {
            const examRes = await getAllExams();
            setExams(examRes.data.$values);

            const classRes = await getAllClasses();
            const classOptions = classRes.data.$values.map(t => ({
                value: t.id,
                label: t.name
            }));
            setClasses(classOptions);
        } catch (e) {
            console.error("Lỗi tải dữ liệu", e);
        }
    }

    useEffect(() => {
        fetchAllExams();
    }, []);

    const activeExams = exams.filter(e => e.status === "ACTIVE");

    const examFields = [
        { name: "name", label: "Tên bài kiểm tra", type: "text" },
        {
            name: "subjectId", label: "Mã học phần", type: "select", options: [
                { value: "2", label: "IT4409" },
                { value: "3", label: "IT4321" },
            ]
        },
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
                        placeholder="Tìm kiếm lớp học..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm 
                      focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
                      placeholder-gray-400 shadow-sm"
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
                    fields={classFields}
                    initialValues={editData || {}}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <div className="mt-8 p-5 rounded-xl bg-green-50 border border-green-200 my-5">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Đang mở</h3>

                <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeExams.map(exam => (
                        <ExamCard
                            key={exam.id}
                            title={exam.name}
                            subtitle={`${exam.subjectCode} - ${exam.teacherName}`}
                            status={exam.status}
                            actions={actions(exam)}
                        />
                    ))}
                </div>
            </div>


            <div className="mt-8 p-5 rounded-xl bg-red-50 border border-red-200 my-5">
                <h3 className="text-lg font-semibold text-red-700 mb-3">Tất cả</h3>

                <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exams.map(exam => (
                        <ExamCard
                            key={exam.id}
                            title={exam.name}
                            subtitle={`Mã lớp học: ${exam.classId}`}
                            durations={exam.durationMinutes}
                            startTime={exam.startTime}
                            endTime={exam.endTime}
                            actions={actions(exam)}
                        />
                    ))}
                </div>
            </div>

        </div>
    )
}