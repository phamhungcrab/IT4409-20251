import { useEffect, useState, useCallback } from "react";
import { InfoCard, CardContent } from "../../components/InfoCard.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DataTable } from "../../components/DataTable.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { getExamDetail, getExamStudentStatus } from "../../services/(admin)/ExamApi.js";

const CMSResults = () => {
    const navigate = useNavigate();
    const { examId } = useParams();

    const [results, setResults] = useState([]);
    const [examDetail, setExamDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [examRes, resultRes] = await Promise.all([
                getExamDetail(examId),
                getExamStudentStatus(examId)
            ]);

            if (resultRes && resultRes.students) setResults(resultRes.students);
            if (examRes) setExamDetail(examRes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const bins = Array(11).fill(0);
    results.forEach(r => {
        if (r.score !== null) bins[Math.floor(r.score)]++;
    });

    const chartData = bins.map((count, score) => ({
        name: `${score}đ`,
        count: count
    }));

    const columns = [
        { header: "MSSV", accessor: "mssv" },
        { header: "Họ và tên", accessor: "studentName" },
        {
            header: "Thời điểm nộp",
            accessor: "submittedAt",
            render: (row) => row.submittedAt
                ? new Date(row.submittedAt).toLocaleString("vi-VN")
                : <span className="text-slate-300 italic">Chưa nộp</span>
        },
        {
            header: "Điểm số",
            accessor: "score",
            render: (row) => row.score !== null
                ? <span className="font-bold text-blue-600 text-lg">{row.score}</span>
                : "—"
        },
        {
            header: "Trạng thái",
            accessor: "status",
            render: (u) => (
                <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-slate-50 text-slate-400 border border-slate-100"
                        }`}
                >
                    {u.status === "COMPLETED" ? "Hoàn thành" : "Chưa xong"}
                </span>
            ),
        }
    ];

    const actions = [
        {
            label: "Chi tiết",
            color: "indigo",
            onClick: (row) => navigate(`/exam-log/${examId}/${row.studentId}`)
        }
    ];

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">ĐANG TẢI DỮ LIỆU...</div>;

    const completedCount = results.filter(r => r.status === "COMPLETED").length;
    const avgScore = results.filter(r => r.score !== null).length > 0
        ? (results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.filter(r => r.score !== null).length).toFixed(2)
        : "0.00";

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    ← Quay lại
                </button>
            </div>

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Báo cáo kết quả</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Thống kê kết quả bài thi #{examId}</p>
            </div>

            <InfoCard className="shadow-sm border border-slate-100 rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">
                        {examDetail?.name || "Thông tin bài thi"}
                    </h2>
                    <div className="flex gap-8 text-sm">
                        <div>
                            <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Thời lượng</span>
                            <span className="font-bold text-slate-700">{examDetail?.durationMinutes} phút</span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Tổng thí sinh</span>
                            <span className="font-bold text-slate-700">{results.length} người</span>
                        </div>
                    </div>
                </CardContent>
            </InfoCard>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
                <div className="lg:col-span-8">
                    <InfoCard className="shadow-sm border border-slate-100 rounded-2xl bg-white h-full">
                        <CardContent className="p-6">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Biểu đồ phổ điểm</h2>
                            <div className="w-full h-64">
                                <ResponsiveContainer>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={10} tick={{ fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 10]} fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} name="Điểm" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </InfoCard>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
                        <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Điểm trung bình</p>
                        <h3 className="text-5xl font-black mt-2 tracking-tighter">{avgScore}</h3>
                    </div>
                    <div className="bg-emerald-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-100">
                        <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">Tỷ lệ hoàn thành</p>
                        <h3 className="text-5xl font-black mt-2 tracking-tighter">
                            {results.length > 0 ? Math.round((completedCount / results.length) * 100) : 0}%
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <DataTable columns={columns} data={results} actions={actions} />
            </div>
        </div>
    );
}

export default CMSResults;