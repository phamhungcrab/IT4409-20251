import { uploadUsersJson } from "../services/(admin)/UserApi";
import { parseExcel } from "../utils/parseExcel";
import { useState } from "react";

export const UsersFormData = ({ onSuccess }) => {
    const [rows, setRows] = useState([]);
    const [, setFile] = useState(null);
    const [, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const columns = [
        { key: "fullName", label: "Họ tên" },
        { key: "dateOfBirth", label: "Ngày sinh" },
        { key: "mssv", label: "MSSV" },
        { key: "email", label: "Email" },
        { key: "password", label: "Mật khẩu" },
        { key: "role", label: "Vai trò" },
    ]

    const handleFileChange = async (e) => {
        const uploadedFile = e.target.files[0];
        setFile(uploadedFile);
        setError("");
        setSuccessMsg("");

        if (!uploadedFile) return;

        setLoading(true);

        const result = await parseExcel(uploadedFile);
        setLoading(false);

        if (result.success) {
            setRows(result.data);
        } else {
            setError(result.error);
        }
    }

    const handleChangeCell = (rowId, key, value) => {
        const updated = [...rows];
        updated[rowId][key] = value;
        setRows(updated);
    }

    const handleSubmit = async () => {
        setError("");
        setSuccessMsg("");

        try {
            const res = await uploadUsersJson(rows);
            setSuccessMsg("Gửi dữ liệu thành công!");
            onSuccess(res);
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
                            {columns.map(c => <th key={c}>{c}</th>)}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col) => (
                                    <td key={col}>
                                        <input
                                            value={row[col] ?? ""}
                                            onChange={(e) =>
                                                handleChangeCell(idx, col, e.target.value)
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
                <button onClick={handleSubmit}>Submit</button>
            )}

            {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}