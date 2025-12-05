// Quản lý ngân hàng câu hỏi
import { useState } from "react";
import { DataTable } from "../../components/DataTable";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";

export const CMSQuestions = () => {

    const [questions, setQuestions] = useState([
        { id: "1", type: "SINGLE_CHOICE", content: "Đơn vị đo cường độ dòng điện trong hệ SI là gì?", point: 1, answer: "A. Ampe (A) (đúng), B. Vôn (V), C.Oát (W), D.Jun (J)", subjectId: 2 },
        { id: "1", type: "SINGLE_CHOICE", content: "Đơn vị đo hiệu điện thế trong hệ SI là gì?", point: 1, answer: "A. Ampe (A), B. Vôn (V) (đúng), C.Oát (W), D.Jun (J)", subjectId: 2 },
        {
            id: "3",
            type: "SINGLE_CHOICE",
            content: "Khi nói về trí tuệ nhân tạo (AI), khái niệm nào dưới đây mô tả chính xác nhất về 'Machine Learning'?",
            point: 1,
            answer: "A. Một nhóm phương pháp giúp máy tính tự học từ dữ liệu mà không cần lập trình rõ ràng từng bước (đúng), B. Một công nghệ giúp máy tính chỉ có thể thực hiện các tác vụ cố định được lập trình sẵn, C. Một kỹ thuật cho phép máy tính vận hành hoàn toàn không cần dữ liệu, D. Một hệ thống mô phỏng hành vi con người bằng cách sao chép trực tiếp não bộ thật",
            subjectId: 5
        }
    ]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);

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
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleSave = (formData) => {
        if (editData) {
            // Update
            setQuestions(questions.map(q =>
                q.id === editData.id ? { ...editData, ...formData } : q
            ));
        } else {
            // Create
            setQuestions([...questions, { id: Date.now(), ...formData }]);
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
        { name: "subjectId", label: "Học phần", type: "number" }
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

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa câu hỏi" : "Thêm câu hỏi"}>
                <Form
                    fields={questionFields}
                    initialValues={editData || {}}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
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