import { useState, useEffect, useCallback } from "react";
import { searchUsersForAdmin } from "../services/(admin)/UserApi";
import { DataTable } from "./DataTable";
import { CommonButton } from "./Button";

export const AddUserToClassForm = ({ onSubmit, onCancel }) => {
    const [activeTab, setActiveTab] = useState("STUDENT");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await searchUsersForAdmin({
                pageNumber: 1,
                pageSize: 10,
                role: activeTab,
                fullName: searchTerm.trim() || null,
            });
            if (res?.data) setUsers(res.data.users);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm]);

    useEffect(() => {
        const timeout = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timeout);
    }, [fetchUsers]);

    const columns = [
        {
            header: "Thành viên",
            accessor: "fullName",
            render: (u) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-sm">{u.fullName}</span>
                    <span className="text-[11px] text-gray-500">{u.email}</span>
                </div>
            ),
        },
        { header: "Mã số", accessor: "mssv" },
        {
            header: "Hành động",
            render: (u) => (
                <button
                    onClick={() => onSubmit({ email: u.email, mssv: u.mssv })}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-md text-xs font-bold transition-all"
                >
                    THÊM
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex p-1 bg-gray-100 rounded-xl">
                <button
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === "STUDENT" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}
                    onClick={() => setActiveTab("STUDENT")}
                >
                    SINH VIÊN
                </button>
                <button
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === "TEACHER" ? "bg-white shadow text-green-600" : "text-gray-500"}`}
                    onClick={() => setActiveTab("TEACHER")}
                >
                    GIÁO VIÊN
                </button>
            </div>

            <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="border rounded-xl max-h-[300px] overflow-y-auto">
                <DataTable columns={columns} data={users} />
            </div>

            <div className="flex justify-end gap-2">
                <CommonButton label="Đóng" color="gray" onClick={onCancel} />
            </div>
        </div>
    );
};