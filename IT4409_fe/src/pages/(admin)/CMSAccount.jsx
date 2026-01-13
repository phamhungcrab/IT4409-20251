import { useState, useEffect, useCallback } from "react";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { ConfirmModal } from "../../components/ConfirmModal";
import { createSingleUser, deleteUser, editUser, searchUsersForAdmin } from "../../services/(admin)/UserApi";
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

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };

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
                dateOfBirthDisplay: formatDateDisplay(u.dateOfBirth)
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
        {
            header: "Họ tên",
            accessor: "fullName",
            render: (user) => (
                <div className="flex items-center gap-3">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                        alt=""
                        className="w-8 h-8 rounded-full border border-gray-200 shrink-0"
                    />
                    <span className="font-medium truncate max-w-[120px] md:max-w-none">{user.fullName}</span>
                </div>
            ),
        },
        { header: "Ngày sinh", accessor: "dateOfBirthDisplay" },
        { header: "MSSV", accessor: "mssv", render: (u) => u.mssv || "—" },
        { header: "Email", accessor: "email" },
        {
            header: "Vai trò",
            accessor: "role",
            render: (u) => (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${u.role === "STUDENT" ? "bg-blue-100 text-blue-700" :
                    u.role === "TEACHER" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                    }`}>
                    {u.role === "STUDENT" ? "Sinh viên" : u.role === "TEACHER" ? "Giảng viên" : "Admin"}
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
            dateOfBirth: formatDateForInput(row.dateOfBirth)
        });
        setOpen(true);
    };

    const handleSave = async (formData) => {
        if (editData) {
            await editUser(formData);
            if (res) toast.success("Cập nhật người dùng thành công!");
        } else {
            await createSingleUser(formData);
            if (res) toast.success("Tạo người dùng thành công!");
        }
        setOpen(false);
        fetchUsers();
    };

    const handleMultipleSuccess = () => {
        setOpenMultiple(false);
        fetchUsers();
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý tài khoản</h1>
                <div className="flex flex-wrap gap-2">
                    <CommonButton label="Tải lên file" color="danger" onClick={() => setOpenMultiple(true)} />
                    <CommonButton label="+ Thêm tài khoản" color="primary" onClick={() => { setEditData(null); setOpen(true); }} />
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            value={filters.email}
                            onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mã số SV</label>
                        <input
                            type="text"
                            placeholder="Nhập MSSV..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            value={filters.mssv}
                            onChange={(e) => setFilters(prev => ({ ...prev, mssv: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vai trò</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            value={filters.role}
                            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                        >
                            <option value="">Tất cả</option>
                            <option value="STUDENT">Sinh viên</option>
                            <option value="TEACHER">Giảng viên</option>
                            <option value="ADMIN">Quản trị viên</option>
                        </select>
                    </div>
                    <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={accounts}
                actions={[
                    { label: "Sửa", color: "gray", onClick: handleEdit },
                    { label: "Xóa", color: "red", onClick: (row) => setDeleteId(row.id) },
                ]}
            />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p>Hiển thị <b>{accounts.length}</b> kết quả</p>
                <div className="flex items-center gap-4">
                    <button
                        disabled={pagination.pageNumber === 1}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                        className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-30 transition-all"
                    >
                        Trước
                    </button>
                    <span className="font-semibold text-gray-800">Trang {pagination.pageNumber}</span>
                    <button
                        disabled={accounts.length < pagination.pageSize}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                        className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-30 transition-all"
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