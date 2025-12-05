//Quản lý lớp học

import { useState } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { DataTable } from "../../components/DataTable";
import { ExamCard } from "../../components/Card";

export const CMSClass = () => {

    const [classes, setClasses] = useState([
        { id: "1", name: "Công nghệ web 20251", teacherId: "1", subjectId: "2", teacherName: "Đỗ Bá Lâm", subjectCode: "IT4409" },
        { id: "2", name: "IOT và ứng dụng 20251", teacherId: "2", subjectId: "3", teacherName: "Đặng Tuấn Linh", subjectCode: "IT4321" }
    ]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const columns = [
        {
            header: "STT",
            accessor: "id"
        },
        {
            header: "Tên lớp học",
            accessor: "name"
        },
        {
            header: "Mã học phần",
            accessor: "subjectCode"
        },
        {
            header: "Giảng viên",
            accessor: "teacherName"
        }
    ];

    const classFields = [
        { name: "name", label: "Tên lớp học", type: "text" },
        {
            name: "subjectId", label: "Mã học phần", type: "select", options: [
                { value: "2", label: "IT4409" },
                { value: "3", label: "IT4321" },
            ]
        },
        {
            name: "teacherId", label: "Giảng viên", type: "select", options: [
                { value: "1", label: "Đỗ Bá Lâm" },
                { value: "2", label: "Đặng Tuấn Linh" }
            ]
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
        setClasses(classes.filter(q => q.id !== id));
    };

    const handleSave = (formData) => {
        if (editData) {
            // Update
            setClasses(classes.map(q =>
                q.id === editData.id ? { ...editData, ...formData } : q
            ));
        } else {
            // Create
            setClasses([...classes, { id: Date.now(), ...formData }]);
        }
        setOpen(false);
    };

    const actions = [
        { label: "Sửa", color: "gray", onClick: handleEdit },
        { label: "Xóa", color: "red", onClick: handleDelete },
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý lớp học</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm lớp học..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm 
                      focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
                      placeholder-gray-400 shadow-sm"
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white 
                      focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
                      shadow-sm"
                    >
                        <option value="">Học phần</option>
                        <option value="2">IT4409</option>
                        <option value="3">IT4321</option>
                    </select>
                </div>

                <CommonButton
                    label="+ Thêm lớp học"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa lớp học" : "Thêm lớp học"}>
                <Form
                    fields={classFields}
                    initialValues={editData || {}}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map(classroom => (
                    <ExamCard
                        key={classroom.id}
                        title={classroom.name}
                        subtitle={`${classroom.subjectCode} - ${classroom.teacherName}`}
                        actions={actions}
                    />
                ))}
            </div>

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {classes.length > 0 ? `1–${classes.length}` : "0"} trong {classes.length} lớp học</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Trước</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>
        </div>
    )
}