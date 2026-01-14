import { addStudentsToClass } from "../services/(admin)/ClassApi";
import { parseExcel } from "../utils/parseExcel";
import { useState } from "react";
import toast from "react-hot-toast";

export const AddStudentToClassForm = ({ onSuccess, classId }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const columns = [
        { key: "mssv", label: "MSSV" },
        { key: "email", label: "Email" },
    ];

    const handleFileChange = async (e) => {
        const uploadedFile = e.target.files[0];
        setError("");
        if (!uploadedFile) return;

        setLoading(true);
        const result = await parseExcel(uploadedFile);
        setLoading(false);

        if (result.success) {
            const mappedData = result.data.map(item => ({
                // Ép kiểu String và hỗ trợ nhiều cách đặt tên cột trong Excel
                mssv: item["MSSV"] || item["mssv"] || item["Mã SV"] ? String(item["MSSV"] || item["mssv"] || item["Mã SV"]) : "",
                email: String(item["Email"] || item["email"] || ""),
            }));

            setRows(mappedData);
            toast.success(`Đã đọc ${mappedData.length} sinh viên`);
        } else {
            setError(result.error);
            toast.error(result.error);
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
            const res = await addStudentsToClass(rows, classId);
            setSuccessMsg("Thêm sinh viên vào lớp thành công!");
            toast.success("Đã đồng bộ danh sách vào lớp học!");
            onSuccess(res);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Lỗi khi gửi dữ liệu";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Input File Style */}
            <div className="flex items-center gap-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                />
            </div>

            {/* Preview Table */}
            {rows.length > 0 && (
                <div className="max-h-[400px] overflow-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
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
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    {columns.map((col) => (
                                        <td key={`${idx}-${col.key}`} className="px-2 py-1">
                                            <input
                                                type="text"
                                                className="w-full px-2 py-1 border border-transparent focus:border-blue-400 focus:bg-white focus:outline-none rounded transition-all bg-transparent"
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

            {/* Action Buttons & Messages */}
            <div className="flex flex-col gap-2">
                {rows.length > 0 && (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md disabled:bg-gray-400 disabled:shadow-none active:transform active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : (
                            `Xác nhận thêm ${rows.length} sinh viên vào lớp`
                        )}
                    </button>
                )}

                {successMsg && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm font-medium text-center">{successMsg}</p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};