import { useState } from "react"
import { parseExcel } from "../utils/parseExcel";
import { uploadManyQuestions } from "../services/QuestionApi";

export const ImportQuestionForm = ({ onSuccess }) => {
    const [rows, setRows] = useState([]);
    const [, setFile] = useState(null);
    const [, setLoading] = useState(false);
    const [error, setError] = useState("");
    const columns = [
        { key: "content", label: "Câu hỏi" },
        { key: "answer", label: "Đáp án" },
        { key: "point", label: "Điểm" },
        { key: "difficulty", label: "Độ khó" },
        { key: "type", label: "Loại câu hỏi" },
        { key: "subjectId", label: "Môn học" },
        { key: "chapter", label: "Chương" }
    ];

    const handleFileChange = async (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        const result = await parseExcel(uploadedFile);

        if (result.success) {
            const mapped = result.data.map(row => ({
                content: row.Content || row.content || row["Câu hỏi"] || "",
                answer: row.Answer || row.answer || row["Đáp án"] || "",
                point: row.Point || row.point || row["Điểm"] || "",
                difficulty: row.Difficulty || row.difficulty || row["Độ khó"] || "",
                type: row.Type || row.type || row["Loại câu hỏi"] || row["Loại"] || "",
                subjectId: row.SubjectId || row.subjectId || row["Mã môn học"] || "",
                chapter: row.Chapter || row.chapter || row["Chương"] || ""
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
            const res = await uploadManyQuestions(rows);
            setSuccessMsg("Gửi dữ liệu thành công!");
            onSuccess(res);
            toast.message("Thêm câu hỏi thành công")
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