import React from "react";
import { DataTable } from "../../components/DataTable";

export const CMSAccounts = () => {
    const users = [
        { id: 1, fullname: "Phạm Đặng Mai Hương", mssv: "20225134", email: "mhmhuong04@gmail.com", role: "student" },
        { id: 2, fullname: "Trần Thị Minh Thu", mssv: "20224901", email: "minhthu@gmail.com", role: "student" },
        { id: 3, fullname: "Trần Thị Hồng Thơm", mssv: "", email: "hongthom@gmail.com", role: "teacher" },
        { id: 4, fullname: "Admin", mssv: "", email: "admin@gmail.com", role: "admin" },
    ];

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

    const actions = [
        { label: "Sửa", color: "indigo", onClick: (u) => alert(`Sửa ${u.fullname}`) },
        { label: "Xóa", color: "red", onClick: (u) => alert(`Xóa ${u.fullname}`) },
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

                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow hover:bg-indigo-500 transition whitespace-nowrap">
                    + Thêm tài khoản
                </button>
            </div>

            <DataTable columns={columns} data={users} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {users.length > 0 ? `1–${users.length}` : "0"} trong {users.length} người dùng</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Trước</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>
        </div>
    );
};
