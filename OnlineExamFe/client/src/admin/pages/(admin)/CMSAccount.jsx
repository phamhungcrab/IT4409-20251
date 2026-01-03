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
            header: "Há» tÃªn",
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
        { header: "NgÃ y sinh", accessor: "dateOfBirth" },
        { header: "MÃ£ sá»‘ SV", accessor: "mssv", render: (u) => u.mssv || "â€”" },
        { header: "Email", accessor: "email" },
        {
            header: "Vai trÃ²",
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
                        ? "Sinh viÃªn"
                        : u.role === "TEACHER"
                            ? "Giáº£ng viÃªn"
                            : "Quáº£n trá»‹ viÃªn"}
                </span>
            ),
        },
    ];

    const accountFields = [
        { name: "fullName", label: "Há» tÃªn", type: "text" },
        { name: "dateOfBirth", label: "NgÃ y sinh", type: "date" },
        { name: "mssv", label: "MÃ£ sá»‘ sinh viÃªn", type: "text" },
        { name: "email", label: "Email", type: "text" },
        {
            name: "role", label: "Vai trÃ²", type: "select", options: [
                { value: "STUDENT", label: "Sinh viÃªn" },
                { value: "TEACHER", label: "GiÃ¡o viÃªn" },
                { value: "ADMIN", label: "Quáº£n trá»‹ viÃªn" }
            ]
        },
        { name: "password", label: "Máº­t kháº©u", type: "text" }
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
            toast.success("ÄÃ£ xÃ³a tÃ i khoáº£n!");
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
            toast.success("Sá»­a tÃ i khoáº£n thÃ nh cÃ´ng!")
        } else {
            // Create
            if (!Array.isArray(formData)) {
                const created = await createSingleUser(formData);
                // console.log("Created user (cms account): ", created);
                setAccounts(prev => [...prev, created]);
                toast.success("Táº¡o tÃ i khoáº£n thÃ nh cÃ´ng!")
            } else {
                const createdList = await uploadUsersJson(formData);
                setAccounts(prev => [...prev, ...createdList]);
                toast.success("ThÃªm nhiá»u tÃ i khoáº£n má»›i thÃ nh cÃ´ng!")
            }
        }
        setOpen(false);
    };

    const actions = [
        { label: "Sá»­a", color: "gray", onClick: handleEdit },
        { label: "XÃ³a", color: "red", onClick: handleDelete },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quáº£n lÃ½ tÃ i khoáº£n</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="TÃ¬m kiáº¿m theo tÃªn hoáº·c email..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                        <option value="">Táº¥t cáº£ vai trÃ²</option>
                        <option value="student">Sinh viÃªn</option>
                        <option value="teacher">Giáº£ng viÃªn</option>
                        <option value="admin">Quáº£n trá»‹ viÃªn</option>
                    </select>
                </div>

                <CommonButton
                    label="+ ThÃªm nhiá»u tÃ i khoáº£n"
                    color="primary"
                    onClick={() => setOpenMultiple(true)}
                />


                <CommonButton
                    label="+ ThÃªm tÃ i khoáº£n"
                    color="danger"
                    onClick={handleAdd}
                />

            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sá»­a thÃ´ng tin tÃ i khoáº£n" : "ThÃªm tÃ i khoáº£n má»›i"}>
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
                title="ThÃªm nhiá»u tÃ i khoáº£n"
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
                title="XÃ³a tÃ i khoáº£n"
                message="Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a tÃ i khoáº£n nÃ y? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c."
                confirmLabel="XÃ³a"
                cancelLabel="Há»§y"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />


            <DataTable columns={columns} data={accounts} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiá»ƒn thá»‹ {accounts.length > 0 ? `1â€“${accounts.length}` : "0"} trong {accounts.length} ngÆ°á»i dÃ¹ng</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">TrÆ°á»›c</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>

        </div>
    );
};

export default CMSAccounts;


