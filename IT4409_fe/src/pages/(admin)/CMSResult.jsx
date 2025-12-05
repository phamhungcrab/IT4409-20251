import { useState } from "react";
import { InfoCard, CardContent } from "../../components/InfoCard.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DataTable } from "../../components/DataTable.jsx";
import { useParams } from "react-router-dom";

// Quản lý kết quả bài kiểm tra
export const CMSResults = () => {
    const [results, setResults] = useState([
        { id: "1", examId: "1", fullname: "Phạm Đặng Mai Hương", mssv: "20225134", points: 10, startTime: "08:00", endTime: "09:00", status: "IN_PROGRESS" },
        { id: "2", examId: "1", fullname: "Trần Thị Minh Thu", mssv: "20225134", points: 10, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "3", examId: "1", fullname: "Trần Thị Hồng Thơm", mssv: "20225134", points: 0, startTime: "", endTime: "", status: "EXPIRED" },
        { id: "4", examId: "1", fullname: "Trần Thị Minh Thu", mssv: "20225134", points: 10, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "5", examId: "1", fullname: "Trần Thị Minh Thu", mssv: "20225134", points: 9, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "6", examId: "1", fullname: "Trần Thị Minh Thu", mssv: "20225134", points: 8, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "7", examId: "1", fullname: "Trần Thị Minh Thu", mssv: "20225134", points: 7, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "8", examId: "1", fullname: "Trần Thị Minh Thu", mssv: "20225134", points: 9, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
    ]);

    const examId = useParams();

    const statusBadge = {
        ACTIVE: {
            text: "Đang mở",
            class: "bg-green-100 text-green-700 border border-green-300"
        },
        INACTIVE: {
            text: "Đã đóng",
            class: "bg-gray-200 text-gray-700 border border-gray-300"
        }
    };

    const examDetails = { id: "1", name: "Công nghệ web 20251", teacherId: "1", subjectId: "2", teacherName: "Đỗ Bá Lâm", subjectCode: "IT4409", status: "ACTIVE" }

    const scoreData = results.map((r) => ({ fullname: r.fullname, points: r.points }));

    const columns = [
        { header: "Thí sinh làm bài", accessor: "fullname" },
        { header: "MSSV", accessor: "mssv" },
        { header: "Giờ bắt đầu", accessor: "startTime" },
        { header: "Giờ kết thúc", accessor: "endTime" },
        {
            header: "Trạng thái làm bài", accessor: "status", render: (u) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${u.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700"
                        : u.status === "COMPLETED"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-purple-700"
                        }`}
                >
                    {u.status === "IN_PROGRESS"
                        ? "Đang làm"
                        : u.status === "COMPLETED"
                            ? "Đã hoàn thành"
                            : "Chưa hoàn thành"}
                </span>
            ),
        }
    ];

    const actions = [
        {
            label: "Xem",
            color: "indigo",
            onClick: () => alert("Xem chi tiết")
        },
        {
            label: "Xóa",
            color: "red",
            onClick: () => alert("Khoá bài thi")
        }
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Kết quả thi</h1>

            <InfoCard className="shadow-md rounded-2xl p-4 my-4 bg-white">
                <CardContent>
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Thông tin bài kiểm tra</h2>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <p><strong>Mã học phần:</strong> {examDetails.subjectCode}</p>
                        <p><strong>Tên bài kiểm tra:</strong> {examDetails.name}</p>
                        <p><strong>Giảng viên:</strong> {examDetails.teacherName}</p>
                        <p><strong>Trạng thái:</strong> <span
                            className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-md ${statusBadge[examDetails.status]?.class}`}
                        >
                            {statusBadge[examDetails.status]?.text}
                        </span></p>
                    </div>
                </CardContent>
            </InfoCard>


            <InfoCard className="shadow-md rounded-2xl p-4 my-4  bg-white">
                <CardContent>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Thống kê điểm</h2>
                    <div className="w-full h-64">
                        <ResponsiveContainer>
                            <BarChart data={scoreData}>
                                <XAxis dataKey="fullname" hide={false} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="points" fill="#AA1D2B" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </InfoCard>

            <DataTable columns={columns} data={results} actions={actions} />

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                <p>Hiển thị {results.length > 0 ? `1–${results.length}` : "0"} trong {results.length} bài làm</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Trước</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>
        </div>
    )
}