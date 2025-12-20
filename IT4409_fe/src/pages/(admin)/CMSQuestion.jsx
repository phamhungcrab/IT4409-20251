// Quản lý ngân hàng câu hỏi
import { useState, useEffect } from "react";
import { DataTable } from "../../components/DataTable";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";
import { createQuestion, deleteQuestion, getAllQuestions, updateQuestion } from "../../services/QuestionApi";
import { getAllSubject } from "../../services/SubjectApi";
import { ImportQuestionForm } from "../../components/ImportQuestionForm";

export const CMSQuestions = () => {

    const [questions, setQuestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [openMultiple, setOpenMultiple] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [selectedQuestionId, setSelectedClassId] = useState(null);

    const fetchAllQuestion = async () => {
        try {
            const questionRes = await getAllQuestions();
            setQuestions(questionRes);

            const subjectRes = await getAllSubject();

            console.log(subjectRes.values);

            const subjectOptions = subjectRes.$values.map(t => ({
                value: t.id,
                label: t.subjectCode + ' - ' + t.name
            }))

            setSubjects(subjectOptions);
        } catch (e) {
            console.error("Lỗi tải dữ liệu", e);
        }
    }

    useEffect(() => {
        fetchAllQuestion();
    }, []);

    const getCorrectAnswer = (answerText) => {
        const parts = answerText.split(",");
        const correct = parts.find(p => p.includes("(đúng)"));
        return correct ? correct.replace("(đúng)", "").trim() : "";
    };

    const renderAnswerList = (answerText) => {
        return answerText
            .split(",")
            .map(a => a.trim())
            .map((a, i) => <div key={i}>{a}</div>);
    };

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
        const res = await deleteQuestion(deleteId);

        if (res) {
            setQuestions(prev => prev.filter(c => c.id !== deleteId));
        }


        setDeleteId(null);
    };

    const handleSave = async (formData) => {
        if (editData) {
            // Update
            const updated = await updateQuestion(formData, editData.id);
            setQuestions(prev =>
                prev.map(c => c.id === updated.id ? updated : c)
            );
        } else {
            // Create
            const created = await createQuestion(formData);
            setQuestions([...questions, created]);
        }
        setOpen(false);
    };

    const questionFields = [
        { name: "content", label: "Nội dung câu hỏi", type: "text" },
        {
            name: "type", label: "Loại câu hỏi", type: "select", options: [
                { value: "SINGLE_CHOICE", label: "Single choice" },
                { value: "MULTI_CHOICE", label: "Multi choice" }
            ]
        },
        { name: "point", label: "Điểm", type: "number" },
        { name: "answer", label: "Danh sách đáp án", type: "text" },
        { name: "subjectId", label: "Học phần", type: "number" },
        { name: "chapter", label: "Chương", type: "number" }
    ];


    const columns = [
        {
            header: "STT",
            accessor: "id",
        },
        {
            header: "Loại câu hỏi",
            accessor: "type",
            render: (u) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${u.type === "SINGLE_CHOICE"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                        }`}
                >
                    {u.type === "SINGLE_CHOICE"
                        ? "SINGLE_CHOICE"
                        : "MULTI_CHOICE"}
                </span>
            )
        },
        {
            header: "Nội dung câu hỏi",
            accessor: "content"
        },
        {
            header: "Điểm",
            accessor: "point"
        },
        {
            header: "Đáp án",
            accessor: "answer",
            render: (u) => (
                <div className="space-y-1">
                    {renderAnswerList(u.answer)}
                </div>
            )
        },
        {
            header: "Đáp án đúng",
            accessor: "answer",
            render: (u) => <span>{getCorrectAnswer(u.answer)}</span>
        },
        {
            header: "Học phần",
            accessor: "subjectId"
        },
        {
            header: "Chương",
            accessor: "chapter"
        }
    ];

    const actions = [
        { label: "Sửa", color: "indigo", onClick: handleEdit },
        { label: "Xóa", color: "red", onClick: handleDelete },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Ngân hàng câu hỏi</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo nội dung câu hỏi..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm 
              focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
              placeholder-gray-400 shadow-sm"
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white 
              focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
              shadow-sm"
                    >
                        <option value="">Tất cả loại câu hỏi</option>
                        <option value="SINGLE_CHOICE">Single choice</option>
                        <option value="MULTI_CHOICE">Multi choice</option>
                    </select>
                </div>

                <CommonButton
                    label="+ Thêm câu hỏi"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa lớp học" : "Thêm lớp học"}>
                <Form
                    fields={questionFields}
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
                <ImportQuestionForm
                    onSuccess={() => {
                        setOpenMultiple(false);
                    }}
                />
            </Modal>

            <DataTable columns={columns} data={questions} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {questions.length > 0 ? `1–${questions.length}` : "0"} trong {questions.length} câu hỏi</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Trước</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>
        </div>
    )
}