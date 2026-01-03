// Quáº£n lÃ½ bÃ i kiá»ƒm tra

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
            console.error("Lá»—i táº£i dá»¯ liá»‡u", e);
        }
    }

    useEffect(() => {
        fetchAllExams();
    }, []);


    const examFields = [
        { name: "name", label: "TÃªn bÃ i kiá»ƒm tra", type: "text" },
        {
            name: "classId", label: "Lá»›p", type: "select", options: classes
        },
        { name: "examBlueprint", label: "MÃ£ template", type: "select", options: blueprints },
        {
            name: "durationMinutes", label: "Thá»i gian lÃ m bÃ i", type: "number"
        },
        { name: "startTime", label: "Thá»i gian báº¯t Ä‘áº§u", type: "date" },
        { name: "endTime", label: "Thá»i gian káº¿t thÃºc", type: "date" }
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
        { label: "Xem chi tiáº¿t", color: "gray", onClick: () => navigate(`/admin/results/${exam.id}`) },
        { label: "Sá»­a", color: "gray", onClick: () => handleEdit(exam) },
        { label: "XÃ³a", color: "red", onClick: () => handleDelete(exam.id) },
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quáº£n lÃ½ bÃ i kiá»ƒm tra</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="TÃ¬m bÃ i kiá»ƒm tra..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                    {/* <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white 
                      focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
                      shadow-sm"
                    >
                        <option value="">Há»c pháº§n</option>
                        <option value="2">IT4409</option>
                        <option value="3">IT4321</option>
                    </select> */}
                </div>

                <CommonButton
                    label="+ Táº¡o bÃ i kiá»ƒm tra"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sá»­a bÃ i kiá»ƒm tra" : "ThÃªm bÃ i kiá»ƒm tra"}>
                <Form
                    fields={examFields}
                    initialValues={editData || {}}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="XÃ³a bÃ i kiá»ƒm tra"
                message="Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a bÃ i kiá»ƒm tra nÃ y? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c."
                confirmLabel="XÃ³a"
                cancelLabel="Há»§y"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />


            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {exams.map(exam => (
                    <ExamCard
                        key={exam.id}
                        title={exam.name}
                        subtitle={`Lá»›p: ${exam.classId}`}
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


