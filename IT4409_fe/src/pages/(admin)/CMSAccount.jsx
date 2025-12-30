import { useState, useEffect } from "react";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { ConfirmModal } from "../../components/ConfirmModal";
import { createSingleUser, deleteUser, editUser, getAllUsers, uploadUsersJson } from "../../services/(admin)/UserApi";
import { UsersFormData } from "../../components/UsersFormData";
import toast from "react-hot-toast";

const CMSAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [openMultiple, setOpenMultiple] = useState(false);

    useEffect(() => {
        const getUsers = async () => {
            const accountData = await getAllUsers();
            // console.log("Data account: ", data)
            const formatted = accountData.map(u => ({
                ...u,
                dateOfBirth: u.dateOfBirth
                    ? new Date(u.dateOfBirth).toLocaleDateString("vi-VN")
                    : ""
            }));

            setAccounts(formatted);
        }

        getUsers();
    }, []);

    const columns = [
        {
            header: "STT",
            accessor: "id",
        },
        {
            header: "Họ tên",
            accessor: "fullName",
            render: (user) => (
                <div className="flex items-center gap-3">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <span className="font-medium">{user.fullName}</span>
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
                    className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === "STUDENT"
                        ? "bg-blue-50 text-blue-700"
                        : u.role === "TEACHER"
                            ? "bg-green-50 text-green-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                >
                    {u.role === "STUDENT"
                        ? "Sinh viên"
                        : u.role === "TEACHER"
                            ? "Giảng viên"
                            : "Quản trị viên"}
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
    ]

    const handleAdd = () => {
        setEditData(null);
        setOpen(true);
    };

    const handleEdit = (row) => {
        setEditData({
            ...row,
            dateOfBirth: row.dateOfBirth
                ? new Date(row.dateOfBirth).toISOString().split("T")[0]
                : ""
        });
        setOpen(true);
    };

    const handleDelete = (row) => {
        setDeleteId(row.id);
    };

    const confirmDelete = async () => {
        const res = await deleteUser(deleteId);

        if (res) {
            setAccounts(prev => prev.filter(acc => acc.id !== deleteId));
            toast.success("Đã xóa tài khoản!");
        }

        setDeleteId(null);
    };



    const handleSave = async (formData) => {
        if (editData) {
            // Update
            const edited = await editUser(editData);
            setAccounts(accounts.map(q =>
                q.id === editData.id ? { ...editData, edited } : q
            ));
            toast.success("Sửa tài khoản thành công!")
        } else {
            // Create
            if (!Array.isArray(formData)) {
                const created = await createSingleUser(formData);
                // console.log("Created user (cms account): ", created);
                setAccounts(prev => [...prev, created]);
                toast.success("Tạo tài khoản thành công!")
            } else {
                const createdList = await uploadUsersJson(formData);
                setAccounts(prev => [...prev, ...createdList]);
                toast.success("Thêm nhiều tài khoản mới thành công!")
            }
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
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="student">Sinh viên</option>
                        <option value="teacher">Giảng viên</option>
                        <option value="admin">Quản trị viên</option>
                    </select>
                </div>

                <CommonButton
                    label="+ Thêm nhiều tài khoản"
                    color="primary"
                    onClick={() => setOpenMultiple(true)}
                />


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

            <Modal
                isOpen={openMultiple}
                onClose={() => setOpenMultiple(false)}
                title="Thêm nhiều tài khoản"
            >
                <UsersFormData
                    onSuccess={(createdList) => {
                        setAccounts(prev => [...prev, ...createdList]);
                        setOpenMultiple(false);
                    }}
                />
            </Modal>


            <ConfirmModal
                isOpen={!!deleteId}
                title="Xóa tài khoản"
                message="Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác."
                confirmLabel="Xóa"
                cancelLabel="Hủy"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />


            <DataTable columns={columns} data={accounts} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {accounts.length > 0 ? `1–${accounts.length}` : "0"} trong {accounts.length} người dùng</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Trước</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>

        </div>
    );
};

export default CMSAccounts;