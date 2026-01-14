import { uploadUsersJson } from "../services/(admin)/UserApi";
import { parseExcel } from "../utils/parseExcel";
import { useState } from "react";
import toast from "react-hot-toast";

export const UsersFormData = ({ onSuccess }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const columns = [
        { key: "fullName", label: "Họ tên" },
        { key: "dateOfBirth", label: "Ngày sinh" },
        { key: "mssv", label: "MSSV" },
        { key: "email", label: "Email" },
        { key: "password", label: "Mật khẩu" },
        { key: "role", label: "Vai trò" },
    ];

    const handleFileChange = async (e) => {
        const uploadedFile = e.target.files[0];
        setError("");
        if (!uploadedFile) return;

        setLoading(true);
        const result = await parseExcel(uploadedFile);
        setLoading(false);

        if (result.success) {
            const mappedData = result.data.map(item => {
                const formatExcelDate = (value) => {
                    if (!value) return "";
                    if (typeof value === 'number') {
                        const date = new Date(Math.round((value - 25569) * 86400 * 1000));
                        return date.toISOString().split('T')[0];
                    }
                    return String(value);
                };
                return {
                    fullName: String(item["Họ tên"] || ""),
                    dateOfBirth: formatExcelDate(item["Ngày sinh"]),
                    mssv: item["MSSV"] ? String(item["MSSV"]) : "",
                    email: String(item["Email"] || ""),
                    password: item["Mật khẩu"] ? String(item["Mật khẩu"]) : "",
                    role: String(item["Vai trò"] || "STUDENT")
                };
            });
            console.log(mappedData);

            setRows(mappedData);
            toast.success(`Đã đọc ${mappedData.length} sinh viên`);
        } else {
            setError(result.error);
        }
    };

    const handleChangeCell = (rowIdx, key, value) => {
        const updated = [...rows];
        updated[rowIdx] = { ...updated[rowIdx], [key]: value };
        setRows(updated);
    };

    const handleSubmit = async () => {
        setError("");
        setSuccessMsg("");
        setLoading(true);

        try {
            const res = await uploadUsersJson(rows);
            if (res) toast.success("Thêm danh sách người dùng thành công!");
            setSuccessMsg("Gửi dữ liệu thành công!");
            onSuccess(res);
        } catch (err) {
            toast.error("Thêm danh sách người dùng thất bại");
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {rows.length > 0 && (
                <div className="max-h-[400px] overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                {columns.map((c) => (
                                    <th key={c.key} className="px-4 py-2 text-left font-bold text-gray-700">
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rows.map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map((col) => (
                                        <td key={`${idx}-${col.key}`} className="px-2 py-1">
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-transparent focus:border-blue-400 focus:outline-none rounded"
                                                value={row[col.key] ?? ""}
                                                onChange={(e) =>
                                                    handleChangeCell(idx, col.key, e.target.value)
                                                }
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex flex-col gap-2">
                {rows.length > 0 && (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400"
                    >
                        {loading ? "Đang xử lý..." : `Xác nhận thêm ${rows.length} người dùng`}
                    </button>
                )}

                {successMsg && <p className="text-green-600 text-sm font-medium">{successMsg}</p>}
                {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
            </div>
        </div>
    );
};