import React, { useState } from "react";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";

export const CMSAccounts = () => {
    const [accounts, setAccounts] = useState([
        { id: 1, fullname: "Phạm Đặng Mai Hương", mssv: "20225134", email: "mhmhuong04@gmail.com", role: "student", password: "123456", dateOfBirth: "2004-12-06" },
        { id: 2, fullname: "Trần Thị Minh Thu", mssv: "20224901", email: "minhthu@gmail.com", role: "student", password: "123456", dateOfBirth: "2004-04-15" },
        { id: 3, fullname: "Trần Thị Hồng Thơm", mssv: "", email: "hongthom@gmail.com", role: "teacher", password: "123456", dateOfBirth: "2003-04-15" },
        { id: 4, fullname: "Admin", mssv: "", email: "admin@gmail.com", role: "admin", password: "123456" },
    ]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const columns = [
        {
            header: "STT",
            accessor: "id",
        },
        {
            header: "Họ tên",
            accessor: "fullname",
            render: (user) => (
                <div className="flex items-center gap-3">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=random`}
                        alt={user.fullname}
                        className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <span className="font-medium">{user.fullname}</span>
                </div>
            ),
        },
        { header: "Ngày sinh", accessor: "dateOfBirth" },
        { header: "Mã số SV", accessor: "mssv", render: (u) => u.mssv || "—" },
        { header: "Email", accessor: "email" },
        {
            header: "Vai trò",
            accessor: "role",
            render: (u) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === "student"
                        ? "bg-blue-50 text-blue-700"
                        : u.role === "teacher"
                            ? "bg-green-50 text-green-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                >
                    {u.role === "student"
                        ? "Sinh viên"
                        : u.role === "teacher"
                            ? "Giảng viên"
                            : "Quản trị viên"}
                </span>
            ),
        },
    ];

    const accountFields = [
        { name: "fullname", label: "Họ tên", type: "text" },
        { name: "dateOfBirth", label: "Ngày sinh", type: "date" },
        { name: "mssv", label: "Mã số sinh viên", type: "text" },
        { name: "email", label: "Email", type: "text" },
        {
            name: "role", label: "Vai trò", type: "select", options: [
                { value: "STUDENT", label: "Sinh viên" },
                { value: "TEACHER", label: "Giáo viên" },
                { value: "ADMIN", label: "Quản trị viên" }
            ]
        },
        { name: "password", label: "Mật khẩu", type: "text" }
    ]

    const handleAdd = () => {
        setEditData(null);
        setOpen(true);
    };

    const handleEdit = (row) => {
        setEditData(row);
        setOpen(true);
    };

    const handleDelete = (id) => {
        setAccounts(subjects.filter(q => q.id !== id));
    };

    const handleSave = (formData) => {
        if (editData) {
            // Update
            setAccounts(subjects.map(q =>
                q.id === editData.id ? { ...editData, ...formData } : q
            ));
        } else {
            // Create
            setAccounts([...subjects, { id: Date.now(), ...formData }]);
        }
        setOpen(false);
    };

    const actions = [
        { label: "Sửa", color: "gray", onClick: handleEdit },
        { label: "Xóa", color: "red", onClick: handleDelete },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý tài khoản</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm 
              focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
              placeholder-gray-400 shadow-sm"
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white 
              focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none 
              shadow-sm"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="student">Sinh viên</option>
                        <option value="teacher">Giảng viên</option>
                        <option value="admin">Quản trị viên</option>
                    </select>
                </div>
                <CommonButton
                    label="+ Thêm tài khoản"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa thông tin tài khoản" : "Thêm tài khoản mới"}>
                <Form
                    fields={accountFields}
                    initialValues={editData || {}}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <DataTable columns={columns} data={accounts} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {accounts.length > 0 ? `1–${accounts.length}` : "0"} trong {accounts.length} bài kiểm tra</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Trước</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>

        </div>
    );
};
