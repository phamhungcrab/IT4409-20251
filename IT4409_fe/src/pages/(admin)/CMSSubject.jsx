// Quản lý học phần
import { useState } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { DataTable } from "../../components/DataTable";

export const CMSSubject = () => {

    const [subjects, setSubjects] = useState([
        { id: "1", name: "Công nghệ web và dịch vụ trực tuyến", code: "IT4409" },
        { id: "2", name: "IOT và ứng dụng 20251", code: "IT4321" }
    ]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const columns = [
        {
            header: "STT",
            accessor: "id"
        },
        {
            header: "Mã học phần",
            accessor: "code"
        },
        {
            header: "Tên học phần",
            accessor: "name"
        }
    ];

    const classFields = [
        { name: "name", label: "Tên học phần", type: "text" },
        {
            name: "subjectId", label: "Mã học phần", type: "text"
        }
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
        setSubjects(subjects.filter(q => q.id !== id));
    };

    const handleSave = (formData) => {
        if (editData) {
            // Update
            setSubjects(subjects.map(q =>
                q.id === editData.id ? { ...editData, ...formData } : q
            ));
        } else {
            // Create
            setSubjects([...subjects, { id: Date.now(), ...formData }]);
        }
        setOpen(false);
    };

    const actions = [
        { label: "Sửa", color: "indigo", onClick: handleEdit },
        { label: "Xóa", color: "red", onClick: handleDelete },
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý môn học</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm môn học..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm 
                      focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
                      placeholder-gray-400 shadow-sm"
                    />
                </div>

                <CommonButton
                    label="+ Thêm môn học"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa môn học" : "Thêm môn học"}>
                <Form
                    fields={classFields}
                    initialValues={editData || {}}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <DataTable columns={columns} data={subjects} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {subjects.length > 0 ? `1–${subjects.length}` : "0"} trong {subjects.length} môn học</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Trước</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>
        </div>
    )
}