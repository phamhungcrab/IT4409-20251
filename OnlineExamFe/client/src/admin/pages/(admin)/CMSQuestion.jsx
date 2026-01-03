// Quáº£n lÃ½ ngÃ¢n hÃ ng cÃ¢u há»i
import { useState, useEffect } from "react";
import { DataTable } from "../../components/DataTable";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";
import { createQuestion, deleteQuestion, getAllQuestions, updateQuestion } from "../../services/(admin)/QuestionApi";
import { getAllSubject } from "../../services/(admin)/SubjectApi";
import { ImportQuestionForm } from "../../components/ImportQuestionForm";

const CMSQuestions = () => {

    const [questions, setQuestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [openMultiple, setOpenMultiple] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [selectedQuestionId, setSelectedClassId] = useState(null);

    const total = questions?.length ?? 0;

    const fetchAllQuestion = async () => {
        try {
            const questionRes = await getAllQuestions();
            setQuestions(questionRes);

            const subjectRes = await getAllSubject();

            console.log(subjectRes.values);

            const subjectOptions = subjectRes.map(t => ({
                value: t.id,
                label: t.subjectCode + ' - ' + t.name
            }))

            setSubjects(subjectOptions);
        } catch (e) {
            console.error("Lá»—i táº£i dá»¯ liá»‡u", e);
        }
    }

    useEffect(() => {
        fetchAllQuestion();
    }, []);

    const getCorrectAnswer = (answerText) => {
        const parts = answerText.split("|");
        const correct = parts.find(p => p.includes("*"));
        return correct ? correct.replace("*", "").trim() : "";
    };

    const renderAnswerList = (answerText) => {
        return answerText
            .split("|")
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
        { name: "content", label: "Ná»™i dung cÃ¢u há»i", type: "text" },
        {
            name: "type", label: "Loáº¡i cÃ¢u há»i", type: "select", options: [
                { value: "SINGLE_CHOICE", label: "Single choice" },
                { value: "MULTI_CHOICE", label: "Multi choice" }
            ]
        },
        { name: "point", label: "Äiá»ƒm", type: "number" },
        { name: "answer", label: "Danh sÃ¡ch Ä‘Ã¡p Ã¡n", type: "text" },
        { name: "subjectId", label: "Há»c pháº§n", type: "number" },
        { name: "chapter", label: "ChÆ°Æ¡ng", type: "number" }
    ];


    const columns = [
        {
            header: "STT",
            accessor: "id",
        },
        {
            header: "Loáº¡i cÃ¢u há»i",
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
            header: "Ná»™i dung cÃ¢u há»i",
            accessor: "content"
        },
        {
            header: "Äiá»ƒm",
            accessor: "point"
        },
        {
            header: "ÄÃ¡p Ã¡n",
            accessor: "answer",
            render: (u) => (
                <div className="space-y-1">
                    {renderAnswerList(u.answer)}
                </div>
            )
        },
        {
            header: "ÄÃ¡p Ã¡n Ä‘Ãºng",
            accessor: "correctAnswer",
            render: (u) => <span>{getCorrectAnswer(u.answer)}</span>
        },
        {
            header: "Há»c pháº§n",
            accessor: "subjectId"
        },
        {
            header: "ChÆ°Æ¡ng",
            accessor: "chapter"
        }
    ];

    const actions = [
        { label: "Sá»­a", color: "indigo", onClick: handleEdit },
        { label: "XÃ³a", color: "red", onClick: handleDelete },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">NgÃ¢n hÃ ng cÃ¢u há»i</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="TÃ¬m kiáº¿m theo ná»™i dung cÃ¢u há»i..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                        <option value="">Táº¥t cáº£ loáº¡i cÃ¢u há»i</option>
                        <option value="SINGLE_CHOICE">Single choice</option>
                        <option value="MULTI_CHOICE">Multi choice</option>
                    </select>
                </div>

                <CommonButton
                    label="+ ThÃªm cÃ¢u há»i"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sá»­a lá»›p há»c" : "ThÃªm lá»›p há»c"}>
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
                title="ThÃªm nhiá»u tÃ i khoáº£n"
            >
                <ImportQuestionForm
                    onSuccess={() => {
                        setOpenMultiple(false);
                    }}
                />
            </Modal>

            <DataTable columns={columns} data={questions} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>
                    Hiá»ƒn thá»‹ {total > 0 ? `1â€“${total}` : "0"} trong {total} cÃ¢u há»i
                </p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">TrÆ°á»›c</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>

        </div>
    )
}

export default CMSQuestions;


