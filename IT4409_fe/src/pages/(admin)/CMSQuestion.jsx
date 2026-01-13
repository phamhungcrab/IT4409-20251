import { useState, useEffect, useCallback } from "react";
import { DataTable } from "../../components/DataTable";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";
import { ConfirmModal } from "../../components/ConfirmModal";
import { createQuestion, deleteQuestion, getAllQuestions, searchQuestionsForAdmin, updateQuestion } from "../../services/(admin)/QuestionApi";
import { getAllSubject } from "../../services/(admin)/SubjectApi";
import { ImportQuestionForm } from "../../components/ImportQuestionForm";

import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const CMSQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [openMultiple, setOpenMultiple] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [deleteId, setDeleteId] = useState(null);

    const [filters, setFilters] = useState({
        content: "",
        subjectId: "",
        type: "",
        pointFrom: null,
        pointTo: null,
        difficultyFrom: null,
        difficultyTo: null,
        chapter: null
    });

    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
    });

    const total = questions?.length ?? 0;

    const fetchAllData = useCallback(async () => {
        try {
            const payload = {
                pageNumber: pagination.pageNumber,
                pageSize: pagination.pageSize,
                content: filters.content?.trim() || null,
                subjectId: filters.subjectId || null,
                type: filters.type || null,
                pointFrom: filters.pointFrom,
                pointTo: filters.pointTo,
                difficultyFrom: filters.difficultyFrom,
                difficultyTo: filters.difficultyTo,
                chapter: filters.chapter
            };

            const [questionRes, subjectRes] = await Promise.all([
                searchQuestionsForAdmin(payload),
                getAllSubject()
            ]);

            console.log(questionRes);

            setQuestions(questionRes.data.users);

            const subjectOptions = subjectRes.map(t => ({
                value: t.id,
                label: `${t.subjectCode} - ${t.name}`
            }));
            setSubjects(subjectOptions);
        } catch (e) {
            console.error("Lỗi tải dữ liệu", e);
        }
    }, [filters, pagination]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAllData();
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchAllData]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    }, [filters]);

    const handleResetFilters = () => {
        setFilters({
            content: "",
            subjectId: "",
            type: "",
            pointFrom: null,
            pointTo: null,
            difficultyFrom: null,
            difficultyTo: null,
            chapter: null
        });
    };

    const renderContentWithMath = (text) => {
        if (!text) return null;
        const parts = text.split(/(\$\$.*?\$\$)/g);
        return parts.map((part, index) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                const formula = part.slice(2, -2);
                return <InlineMath key={index} math={formula} />;
            }
            return part;
        });
    };

    const getCorrectAnswerLabels = (answerText) => {
        if (!answerText) return "N/A";
        const parts = answerText.split("||");
        const labels = [];
        parts.forEach((part, index) => {
            if (part.trim().includes("*")) {
                labels.push(String.fromCharCode(65 + index));
            }
        });
        return labels.length > 0 ? labels.join(", ") : "Chưa chọn";
    };

    const renderStyledAnswers = (answerText) => {
        return answerText.split("||").map(a => a.trim()).map((a, i) => {
            const isCorrect = a.includes("*");
            const cleanText = a.replace("*", "").trim();
            const label = String.fromCharCode(65 + i);
            return (
                <div key={i} className={`flex items-start gap-2 py-0.5 ${isCorrect ? "text-emerald-600 font-bold" : "text-slate-600"}`}>
                    <span className="shrink-0">{label}.</span>
                    <span>{renderContentWithMath(cleanText)}</span>
                </div>
            );
        });
    };

    const columns = [
        {
            header: "ID",
            accessor: "id",
            render: (u) => <div className="min-w-[200px]">{u.id}</div>
        },
        {
            header: "Nội dung câu hỏi",
            accessor: "content",
            render: (u) => <div className="max-w-md leading-relaxed">{renderContentWithMath(u.content)}</div>
        },
        {
            header: "Đáp án",
            accessor: "answer",
            render: (u) => <div className="min-w-[200px]">{renderStyledAnswers(u.answer)}</div>
        },
        {
            header: "Đúng",
            accessor: "correct",
            render: (u) => (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-black text-xs">
                    {getCorrectAnswerLabels(u.answer)}
                </span>
            )
        },
        {
            header: "Học phần",
            accessor: "subjectId",
            render: (u) => <span className="text-xs font-semibold text-slate-500">{u.subjectId}</span>
        },
        {
            header: "Phân loại",
            accessor: "type",
            render: (u) => (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${u.type === "SINGLE_CHOICE" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                    {u.type === "SINGLE_CHOICE" ? "Một đáp án" : "Nhiều đáp án"}
                </span>
            )
        }
    ];

    const actions = [
        { label: "Sửa", color: "indigo", onClick: (row) => { setEditData(row); setOpen(true); } },
        { label: "Xóa", color: "red", onClick: (row) => setDeleteId(row.id) },
    ];

    const handleSave = async (formData) => {
        try {
            if (editData) { await updateQuestion(formData, editData.id); }
            else { await createQuestion(formData); }
            setOpen(false);
            fetchAllData();
        } catch (e) { console.error(e); }
    };

    const confirmDelete = async () => {
        const res = await deleteQuestion(deleteId);
        if (res) fetchAllData();
        setDeleteId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Ngân hàng câu hỏi</h1>
                <div className="flex gap-2">
                    {/* <CommonButton label="Import Excel" color="gray" onClick={() => setOpenMultiple(true)} /> */}
                    <CommonButton label="+ Thêm câu hỏi" color="danger" onClick={() => { setEditData(null); setOpen(true); }} />
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                <div className="lg:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Nội dung câu hỏi</label>
                    <input
                        type="text"
                        placeholder="Tìm kiếm nội dung..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={filters.content}
                        onChange={(e) => setFilters(prev => ({ ...prev, content: e.target.value }))}
                    />
                </div>
                <div className="lg:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Mã học phần</label>
                    <select
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        value={filters.subjectId}
                        onChange={(e) => setFilters(prev => ({ ...prev, subjectId: e.target.value }))}
                    >
                        <option value="">Tất cả học phần</option>
                        {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Loại câu hỏi</label>
                    <select
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                        <option value="">Tất cả</option>
                        <option value="SINGLE_CHOICE">Một đáp án</option>
                        <option value="MULTI_CHOICE">Nhiều đáp án</option>
                    </select>
                </div>
                <div className="lg:col-span-2">
                    <button
                        onClick={handleResetFilters}
                        className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition-all border border-slate-200 h-[38px]"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            <DataTable columns={columns} data={questions} actions={actions} />

            <div className="flex justify-between items-center py-4 bg-white px-6 rounded-xl border border-slate-100 shadow-sm text-sm text-slate-500 font-medium">
                <p>Tổng số: <span className="text-slate-900 font-bold">{total}</span> câu hỏi</p>
                <div className="flex gap-2 font-semibold">
                    <button
                        disabled={pagination.pageNumber === 1}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                        className="px-4 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30"
                    >
                        Trước
                    </button>
                    <span className="flex items-center px-2 text-slate-700">Trang {pagination.pageNumber}</span>
                    <button
                        disabled={questions.length < pagination.pageSize}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                        className="px-4 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30"
                    >
                        Sau
                    </button>
                </div>
            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}>
                <Form
                    fields={[
                        { name: "content", label: "Nội dung câu hỏi", type: "textarea" },
                        { name: "type", label: "Loại câu hỏi", type: "select", options: [{ value: "SINGLE_CHOICE", label: "Single choice" }, { value: "MULTI_CHOICE", label: "Multi choice" }] },
                        { name: "point", label: "Điểm số", type: "number" },
                        { name: "answer", label: "Đáp án (Phân cách |)", type: "text" },
                        { name: "subjectId", label: "Học phần", type: "select", options: subjects },
                        { name: "chapter", label: "Chương", type: "number" }
                    ]}
                    initialValues={editData || { content: "", type: "SINGLE_CHOICE", point: 1 }}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <Modal isOpen={openMultiple} onClose={() => setOpenMultiple(false)} title="Import câu hỏi từ Excel">
                <ImportQuestionForm onSuccess={() => { setOpenMultiple(false); fetchAllData(); }} />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Xác nhận xóa"
                message="Câu hỏi này sẽ bị xóa vĩnh viễn khỏi hệ thống."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}

export default CMSQuestions;