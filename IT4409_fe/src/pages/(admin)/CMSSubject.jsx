import { useState, useEffect, useCallback } from "react";
import { Form } from "../../components/Form";
import { CommonButton } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { DataTable } from "../../components/DataTable";
import { ConfirmModal } from "../../components/ConfirmModal";
import { createSubject, deleteSubject, editSubject, searchSubjects } from "../../services/(admin)/SubjectApi";
import toast from "react-hot-toast";

const CMSSubject = () => {
    const [subjects, setSubjects] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [filters, setFilters] = useState({
        name: "",
        subjectCode: ""
    });
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 10,
    });

    const fetchSubjects = useCallback(async () => {
        const payload = {
            pageSize: pagination.pageSize,
            pageNumber: pagination.pageNumber,
            name: filters.name?.trim() || "",
            subjectCode: filters.subjectCode?.trim() || ""
        };

        const res = await searchSubjects(payload);
        if (res && res.data) {
            setSubjects(res.data.users);
        }
    }, [filters, pagination]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchSubjects();
        }, 400);
        return () => clearTimeout(timeout);
    }, [fetchSubjects]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageNumber: 1 }));
    }, [filters]);

    const columns = [
        { header: "STT", accessor: "id" },
        { header: "Mã học phần", accessor: "subjectCode" },
        { header: "Tên học phần", accessor: "name" },
        { header: "Số chương", accessor: "totalChapters" }
    ];

    const classFields = [
        { name: "name", label: "Tên học phần", type: "text" },
        { name: "subjectCode", label: "Mã học phần", type: "text" },
        { name: "totalChapters", label: "Tổng số chương", type: "number" }
    ];

    const handleSave = async (formData) => {
        try {
            if (editData) {
                // Update
                await editSubject(editData.id, formData);
                toast.success("Cập nhật học phần thành công!");
            } else {
                // Create
                await createSubject(formData);
                toast.success("Thêm học phần mới thành công!");
            }
            setOpen(false);
            fetchSubjects();
        } catch (error) {
            toast.error("Thao tác thất bại. Vui lòng thử lại!");
        }
    };

    const confirmDelete = async () => {
        const res = await deleteSubject(deleteId);
        if (res) {
            toast.success("Đã xóa học phần!");
            fetchSubjects();
        }
        setDeleteId(null);
    };

    const actions = [
        { label: "Sửa", color: "indigo", onClick: (row) => { setEditData(row); setOpen(true); } },
        { label: "Xóa", color: "red", onClick: (row) => setDeleteId(row.id) },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý môn học</h1>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <input
                        type="text"
                        placeholder="Tìm theo tên học phần..."
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-400"
                        value={filters.name}
                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                        type="text"
                        placeholder="Mã học phần..."
                        className="w-40 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-400"
                        value={filters.subjectCode}
                        onChange={(e) => setFilters(prev => ({ ...prev, subjectCode: e.target.value }))}
                    />
                </div>

                <CommonButton
                    label="+ Thêm môn học"
                    color="danger"
                    onClick={() => { setEditData(null); setOpen(true); }}
                />
            </div>

            <DataTable columns={columns} data={subjects} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {subjects.length} môn học</p>
                <div className="flex items-center gap-2">
                    <button
                        disabled={pagination.pageNumber === 1}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                        Trước
                    </button>
                    <span>Trang {pagination.pageNumber}</span>
                    <button
                        disabled={subjects.length < pagination.pageSize}
                        onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                        Sau
                    </button>
                </div>
            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title={editData ? "Sửa môn học" : "Thêm môn học"}>
                <Form
                    fields={classFields}
                    initialValues={editData || { name: "", subjectCode: "", totalChapters: 0 }}
                    onSubmit={handleSave}
                    onCancel={() => setOpen(false)}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Xóa học phần"
                message="Bạn có chắc chắn muốn xóa học phần này?"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}

export default CMSSubject;