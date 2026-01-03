import { useState } from "react";
import { InfoCard, CardContent } from "../../components/InfoCard.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DataTable } from "../../components/DataTable.jsx";
import { useParams } from "react-router-dom";

// Quáº£n lÃ½ káº¿t quáº£ bÃ i kiá»ƒm tra
const CMSResults = () => {
    const [results, setResults] = useState([
        { id: "1", examId: "1", fullname: "Pháº¡m Äáº·ng Mai HÆ°Æ¡ng", mssv: "20225134", points: 10, startTime: "08:00", endTime: "09:00", status: "IN_PROGRESS" },
        { id: "2", examId: "1", fullname: "Tráº§n Thá»‹ Minh Thu", mssv: "20225134", points: 10, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "3", examId: "1", fullname: "Tráº§n Thá»‹ Há»“ng ThÆ¡m", mssv: "20225134", points: 0, startTime: "", endTime: "", status: "EXPIRED" },
        { id: "4", examId: "1", fullname: "Tráº§n Thá»‹ Minh Thu", mssv: "20225134", points: 10, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "5", examId: "1", fullname: "Tráº§n Thá»‹ Minh Thu", mssv: "20225134", points: 9, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "6", examId: "1", fullname: "Tráº§n Thá»‹ Minh Thu", mssv: "20225134", points: 8, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "7", examId: "1", fullname: "Tráº§n Thá»‹ Minh Thu", mssv: "20225134", points: 7, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
        { id: "8", examId: "1", fullname: "Tráº§n Thá»‹ Minh Thu", mssv: "20225134", points: 9, startTime: "08:00", endTime: "09:00", status: "COMPLETED" },
    ]);

    const examId = useParams();

    const statusBadge = {
        ACTIVE: {
            text: "Äang má»Ÿ",
            class: "bg-green-100 text-green-700 border border-green-300"
        },
        INACTIVE: {
            text: "ÄÃ£ Ä‘Ã³ng",
            class: "bg-gray-200 text-gray-700 border border-gray-300"
        }
    };

    const examDetails = { id: "1", name: "CÃ´ng nghá»‡ web 20251", teacherId: "1", subjectId: "2", teacherName: "Äá»— BÃ¡ LÃ¢m", subjectCode: "IT4409", status: "ACTIVE" }

    const scoreData = results.map((r) => ({ fullname: r.fullname, points: r.points }));

    const columns = [
        { header: "ThÃ­ sinh lÃ m bÃ i", accessor: "fullname" },
        { header: "MSSV", accessor: "mssv" },
        { header: "Giá» báº¯t Ä‘áº§u", accessor: "startTime" },
        { header: "Giá» káº¿t thÃºc", accessor: "endTime" },
        {
            header: "Tráº¡ng thÃ¡i lÃ m bÃ i", accessor: "status", render: (u) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${u.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700"
                        : u.status === "COMPLETED"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-purple-700"
                        }`}
                >
                    {u.status === "IN_PROGRESS"
                        ? "Äang lÃ m"
                        : u.status === "COMPLETED"
                            ? "ÄÃ£ hoÃ n thÃ nh"
                            : "ChÆ°a hoÃ n thÃ nh"}
                </span>
            ),
        }
    ];

    const actions = [
        {
            label: "Xem",
            color: "indigo",
            onClick: () => alert("Xem chi tiáº¿t")
        },
        {
            label: "XÃ³a",
            color: "red",
            onClick: () => alert("KhoÃ¡ bÃ i thi")
        }
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Káº¿t quáº£ thi</h1>

            <InfoCard className="shadow-md rounded-2xl p-4 my-4 bg-white">
                <CardContent>
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">ThÃ´ng tin bÃ i kiá»ƒm tra</h2>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <p><strong>MÃ£ há»c pháº§n:</strong> {examDetails.subjectCode}</p>
                        <p><strong>TÃªn bÃ i kiá»ƒm tra:</strong> {examDetails.name}</p>
                        <p><strong>Giáº£ng viÃªn:</strong> {examDetails.teacherName}</p>
                        <p><strong>Tráº¡ng thÃ¡i:</strong> <span
                            className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-md ${statusBadge[examDetails.status]?.class}`}
                        >
                            {statusBadge[examDetails.status]?.text}
                        </span></p>
                    </div>
                </CardContent>
            </InfoCard>


            <InfoCard className="shadow-md rounded-2xl p-4 my-4  bg-white">
                <CardContent>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Thá»‘ng kÃª Ä‘iá»ƒm</h2>
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
                <p>Hiá»ƒn thá»‹ {results.length > 0 ? `1â€“${results.length}` : "0"} trong {results.length} bÃ i lÃ m</p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">TrÆ°á»›c</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-100">Sau</button>
                </div>
            </div>
        </div>
    )
}

export default CMSResults;


