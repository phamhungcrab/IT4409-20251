import toast from "react-hot-toast";
import { addStudentsToClass } from "../services/(admin)/ClassApi";
import { parseExcel } from "../utils/parseExcel";
import { useState } from "react";

export const AddStudentToClassForm = ({ onSuccess, classId }) => {
    const [rows, setRows] = useState([]);
    const [, setFile] = useState(null);
    const [, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const columns = [
        { key: "mssv", label: "MSSV" },
        { key: "email", label: "Email" },
    ]

    const handleFileChange = async (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        const result = await parseExcel(uploadedFile);

        if (result.success) {
            const mapped = result.data.map(row => ({
                mssv: row.MSSV || row.mssv || row["Mã SV"] || "",
                email: row.Email || row.email || "",
            }));

            setRows(mapped);
        } else {
            setError(result.error);
        }
    };


    const handleChangeCell = (rowId, key, value) => {
        const updated = [...rows];
        updated[rowId][key] = value;
        setRows(updated);
    }

    const handleSubmit = async () => {
        setError("");
        setSuccessMsg("");

        try {
            const res = await addStudentsToClass(rows, classId);
            setSuccessMsg("Gửi dữ liệu thành công!");
            onSuccess(res);
            toast.message("Thêm sinh viên vào lớp thành công")
        } catch (err) {
            setError(err.message);
        }

    }

    return (
        <div>
            <input type="file" onChange={handleFileChange} />

            {rows.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            {columns.map(c => <th key={c.key}>{c.label}</th>)}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        <input
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
            )}

            {rows.length > 0 && (
                <button onClick={handleSubmit}>Xác nhận</button>
            )}

            {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}