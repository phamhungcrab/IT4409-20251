import { useState, useEffect, useCallback } from "react";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { ConfirmModal } from "../../components/ConfirmModal";
import { createSingleUser, deleteUser, editUser, searchUsersForAdmin, uploadUsersJson } from "../../services/(admin)/UserApi";
import { UsersFormData } from "../../components/UsersFormData";
import toast from "react-hot-toast";

const CMSAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [openMultiple, setOpenMultiple] = useState(false);

    const [filters, setFilters] = useState({
        fullName: "",
        mssv: "",
        email: "",
        role: "",
        dobFrom: "",
        dobTo: ""
    });

    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
    });

    const fetchUsers = useCallback(async () => {
        const payload = {
            pageSize: pagination.pageSize,
            pageNumber: pagination.pageNumber,
            fullName: filters.fullName?.trim() || null,
            mssv: filters.mssv?.trim() || null,
            email: filters.email?.trim() || null,
            role: filters.role || null,
            dobFrom: filters.dobFrom || null,
            dobTo: filters.dobTo || null,
        };

        const res = await searchUsersForAdmin(payload);
        if (res && res.data) {
            const formatted = res.data.users.map(u => ({
                ...u,
                dateOfBirthDisplay: u.dateOfBirth
                    ? new Date(u.dateOfBirth).toLocaleDateString("vi-VN")
                    : "—"
            }));
            setAccounts(formatted);
        }
    }, [filters, pagination]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 400);
        return () => clearTimeout(timeout);
    }, [fetchUsers]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    }, [filters]);

    const handleResetFilters = () => {
        setFilters({
            fullName: "",
            mssv: "",
            email: "",
            role: "",
            dobFrom: "",
            dobTo: ""
        });
    };

    const columns = [
        { header: "STT", accessor: "id" },
        {
            header: "Họ tên",
            accessor: "fullName",
            render: (user) => (
                <div className="flex items-center gap-3">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                        alt=""
                        className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <span className="font-medium">{user.fullName}</span>
                </div>
            ),
        },
        { header: "Ngày sinh", accessor: "dateOfBirthDisplay" },
        { header: "Mã số SV", accessor: "mssv", render: (u) => u.mssv || "—" },
        { header: "Email", accessor: "email" },
        {
            header: "Vai trò",
            accessor: "role",
            render: (u) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === "STUDENT" ? "bg-blue-50 text-blue-700" :
                    u.role === "TEACHER" ? "bg-green-50 text-green-700" : "bg-purple-50 text-purple-700"
                    }`}>
                    {u.role === "STUDENT" ? "Sinh viên" : u.role === "TEACHER" ? "Giảng viên" : "Quản trị viên"}
                </span>
            ),
        },
    ];

    const accountFields = [
        { name: "fullName", label: "Họ tên", type: "text" },
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
    ];

    const handleEdit = (row) => {
        setEditData({
            ...row,
            dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth).toISOString().split("T")[0] : ""
        });
        setOpen(true);
    };

    const handleSave = async (formData) => {
        if (editData) {
            await editUser(formData, editData.id);
            toast.success("Cập nhật thành công!");
        } else {
            await createSingleUser(formData);
            toast.success("Tạo tài khoản thành công!");
        }
        setOpen(false);
        fetchUsers();
    };

    const handleMultipleSuccess = (responseFromApi) => {
        setOpenMultiple(false);
        fetchUsers();
        toast.success("Đã đồng bộ danh sách từ Excel vào hệ thống!");
    };


    const confirmDelete = async () => {
        const res = await deleteUser(deleteId);
        if (res) {
            toast.success("Đã xóa tài khoản!");
            fetchUsers();
        }
        setDeleteId(null);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý tài khoản</h1>
                <div className="flex gap-2">
                    <CommonButton label="Thêm nhiều" color="primary" onClick={() => setOpenMultiple(true)} />
                    <CommonButton label="+ Thêm tài khoản" color="danger" onClick={() => { setEditData(null); setOpen(true); }} />
                </div>
            </div>

            <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                            value={filters.email}
                            onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mã số SV</label>
                        <input
                            type="text"
                            placeholder="Nhập MSSV..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                            value={filters.mssv}
                            onChange={(e) => setFilters(prev => ({ ...prev, mssv: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vai trò</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-400"
                            value={filters.role}
                            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="STUDENT">Sinh viên</option>
                            <option value="TEACHER">Giảng viên</option>
                            <option value="ADMIN">Quản trị viên</option>
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={handleResetFilters}
                            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            <DataTable columns={columns} data={accounts} actions={[
                { label: "Sửa", color: "gray", onClick: handleEdit },
                { label: "Xóa", color: "red", onClick: (row) => setDeleteId(row.id) },
            ]} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm">
                <p>Hiển thị <b>{accounts.length}</b> người dùng</p>
                <div className="flex items-center gap-2">
                    <button
                        disabled={pagination.pageNumber === 1}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                        className="px-4 py-1 border rounded hover:bg-gray-50 disabled:opacity-30"
                    >
                        Trước
                    </button>
                    <span className="font-medium">Trang {pagination.pageNumber}</span>
                    <button
                        disabled={accounts.length < pagination.pageSize}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                        className="px-4 py-1 border rounded hover:bg-gray-50 disabled:opacity-30"
                    >
                        Sau
                    </button>
                </div>
            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa tài khoản" : "Thêm tài khoản"}>
                <Form fields={accountFields} initialValues={editData || {}} onSubmit={handleSave} onCancel={() => setOpen(false)} />
            </Modal>

            <Modal isOpen={openMultiple} onClose={() => setOpenMultiple(false)} title="Nhập danh sách từ Excel">
                <div className="p-1">
                    <UsersFormData onSuccess={handleMultipleSuccess} />
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Xóa tài khoản"
                message="Hành động này không thể hoàn tác."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};

export default CMSAccounts;