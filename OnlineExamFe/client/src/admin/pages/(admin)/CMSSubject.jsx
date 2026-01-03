// Quáº£n lÃ½ há»c pháº§n
import { useState, useEffect } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { DataTable } from "../../components/DataTable";
import { ConfirmModal } from "../../components/ConfirmModal";
import { createSubject, deleteSubject, editSubject, getAllSubject } from "../../services/(admin)/SubjectApi";

const CMSSubject = () => {

    const [subjects, setSubjects] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        const getSubjects = async () => {
            const res = await getAllSubject();
            setSubjects(res);
        }

        getSubjects();
    }, []);

    const columns = [
        {
            header: "STT",
            accessor: "id"
        },
        {
            header: "MÃ£ há»c pháº§n",
            accessor: "subjectCode"
        },
        {
            header: "TÃªn há»c pháº§n",
            accessor: "name"
        },
        {
            header: "Sá»‘ chÆ°Æ¡ng",
            accessor: "totalChapters"
        }
    ];

    const classFields = [
        { name: "name", label: "TÃªn há»c pháº§n", type: "text" },
        { name: "subjectCode", label: "MÃ£ há»c pháº§n", type: "text" },
        { name: "totalChapters", label: "Tá»•ng sá»‘ chÆ°Æ¡ng", type: "number" }
    ];

    const handleAdd = () => {
        setEditData(null);
        setOpen(true);
    };

    const handleEdit = (row) => {
        setEditData(row);
        setOpen(true);
    };

    const handleDelete = (row) => {
        setDeleteId(row.id);
    };

    const confirmDelete = async () => {
        const res = await deleteSubject(deleteId);

        if (res) {
            setSubjects(prev => prev.filter(acc => acc.id !== deleteId));
        }

        setDeleteId(null);
    };

    const handleSave = async (formData) => {
        if (editData) {
            // Update
            const edited = await editSubject(editData.id, formData);
            setSubjects(subjects.map(q =>
                q.id === editData.id ? { ...editData, edited } : q
            ));
        } else {
            // Create
            const created = await createSubject(formData);
            setSubjects([...subjects, created]);
        }
        setOpen(false);
    };

    const actions = [
        { label: "Sá»­a", color: "indigo", onClick: handleEdit },
        { label: "XÃ³a", color: "red", onClick: handleDelete },
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quáº£n lÃ½ mÃ´n há»c</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="TÃ¬m kiáº¿m mÃ´n há»c..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                </div>

                <CommonButton
                    label="+ ThÃªm mÃ´n há»c"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sá»­a mÃ´n há»c" : "ThÃªm mÃ´n há»c"}>
                <Form
                    fields={classFields}
                    initialValues={editData || {}}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="XÃ³a há»c pháº§n"
                message="Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a há»c pháº§n nÃ y? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c."
                confirmLabel="XÃ³a"
                cancelLabel="Há»§y"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />

            <DataTable columns={columns} data={subjects} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiá»ƒn thá»‹ {subjects.length > 0 ? `1â€“${subjects.length}` : "0"} trong {subjects.length} mÃ´n há»c</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">TrÆ°á»›c</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>
        </div>
    )
}

export default CMSSubject;


