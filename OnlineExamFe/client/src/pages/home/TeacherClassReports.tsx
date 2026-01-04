import React, { useEffect, useState, useMemo } from 'react';
import { examService, ExamStudentStatus } from '../../services/examService';

interface TeacherClassReportsProps {
  classId: number;
  className: string;
  exams: any[]; // Exam basic info
  students: any[]; // Student basic info
}

interface ExamStats {
  examId: number;
  examName: string;
  totalStudents: number;
  submittedCount: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  scoreDistribution: number[]; // [0-2, 2-4, 4-6, 6-8, 8-10]
  passRate: number; // >= 5.0
}

const TeacherClassReports: React.FC<TeacherClassReportsProps> = ({ classId, className, exams, students }) => {
  const [stats, setStats] = useState<ExamStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchStats = async () => {
      if (exams.length === 0) return;
      setLoading(true);
      try {
        const promises = exams.map(async (exam) => {
          try {
            const data = await examService.getExamStudentsStatus(exam.id);
            const statuses = data.students.filter(s => s.status === 'COMPLETED' && s.score !== null);

            const scores = statuses.map(s => s.score || 0);
            const total = scores.length;

            if (total === 0) {
              return {
                examId: exam.id,
                examName: exam.name,
                totalStudents: students.length,
                submittedCount: 0,
                averageScore: 0,
                maxScore: 0,
                minScore: 0,
                scoreDistribution: [0, 0, 0, 0, 0],
                passRate: 0
              };
            }

            const average = scores.reduce((a, b) => a + b, 0) / total;
            const max = Math.max(...scores);
            const min = Math.min(...scores);
            const passCount = scores.filter(s => s >= 5).length;

            // Distribution: 0-2, 2-4, 4-6, 6-8, 8-10
            const dist = [0, 0, 0, 0, 0];
            scores.forEach(s => {
              if (s < 2) dist[0]++;
              else if (s < 4) dist[1]++;
              else if (s < 6) dist[2]++;
              else if (s < 8) dist[3]++;
              else dist[4]++;
            });

            return {
              examId: exam.id,
              examName: exam.name,
              totalStudents: students.length,
              submittedCount: total,
              averageScore: average,
              maxScore: max,
              minScore: min,
              scoreDistribution: dist,
              passRate: (passCount / total) * 100
            };
          } catch (e) {
            console.error(`Failed to fetch stats for exam ${exam.id}`, e);
            return null;
          }
        });

        const results = await Promise.all(promises);
        setStats(results.filter(Boolean) as ExamStats[]);
      } catch (err) {
        console.error("Error fetching report data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [exams, students.length]);

  const currentStats = useMemo(() => {
    if (selectedExamId === 'all') {
      // Calculate overall stats (average of averages)
      if (stats.length === 0) return null;

      const totalSubmitted = stats.reduce((sum, s) => sum + s.submittedCount, 0);
      const dist = [0, 0, 0, 0, 0];
      stats.forEach(s => {
        for(let i=0; i<5; i++) dist[i] += s.scoreDistribution[i];
      });

      return {
        examName: 'Tất cả kỳ thi',
        averageScore: stats.reduce((sum, s) => sum + s.averageScore, 0) / stats.length,
        passRate: stats.reduce((sum, s) => sum + s.passRate, 0) / stats.length,
        submittedCount: totalSubmitted,
        scoreDistribution: dist
      };
    } else {
      return stats.find(s => s.examId === selectedExamId) || null;
    }
  }, [selectedExamId, stats]);

  const handleExportCSV = () => {
    const headers = ["Kỳ thi", "Tổng SV", "Đã nộp", "Điểm TB", "Cao nhất", "Thấp nhất", "Tỉ lệ đạt (%)"];
    const rows = stats.map(s => [
      s.examName,
      s.totalStudents,
      s.submittedCount,
      s.averageScore.toFixed(2),
      s.maxScore,
      s.minScore,
      s.passRate.toFixed(1)
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BaoCao_Lop_${className}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">Đang tổng hợp dữ liệu báo cáo...</div>;
  }

  if (exams.length === 0) {
    return <div className="p-8 text-center text-slate-400">Chưa có dữ liệu bài thi để báo cáo.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:bg-white print:text-black">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <select
          className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2 min-w-[200px]"
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <option value="all">Tất cả kỳ thi</option>
          {stats.map(s => (
            <option key={s.examId} value={s.examId}>{s.examName}</option>
          ))}
        </select>

        <div className="flex gap-2">
           <button onClick={handleExportCSV} className="btn bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30">
             📥 Xuất CSV
           </button>
           <button onClick={handlePrint} className="btn bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 border-sky-500/30">
             🖨️ In Báo cáo (PDF)
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      {currentStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="panel p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 print:border-gray-300 print:bg-none">
            <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-1">Điểm trung bình</h3>
            <div className="text-3xl font-bold text-white print:text-black">{currentStats.averageScore.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-2">Thang điểm 10</div>
          </div>
          <div className="panel p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 print:border-gray-300 print:bg-none">
            <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-1">Tỉ lệ đạt (&ge; 5)</h3>
            <div className="text-3xl font-bold text-emerald-400 print:text-black">{currentStats.passRate.toFixed(1)}%</div>
             <div className="text-xs text-slate-500 mt-2">{currentStats.submittedCount} bài nộp</div>
          </div>
           {/* Chart Distribution (Simple CSS Bar Chart) */}
           <div className="panel p-4 md:col-span-1 border-white/10 bg-white/5 print:border-gray-300 print:bg-none">
              <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-3">Phổ điểm</h3>
              <div className="flex items-end h-40 gap-2 mt-4">
                 {currentStats.scoreDistribution.map((count, idx) => {
                    const maxCount = Math.max(...currentStats.scoreDistribution) || 1;
                    // Min height 10% để luôn thấy chân cột nếu có dữ liệu > 0
                    let heightPercent = (count / maxCount) * 100;
                    if (count > 0 && heightPercent < 10) heightPercent = 10;

                    const labels = ['0-2', '2-4', '4-6', '6-8', '8-10'];
                    const colors = ['bg-rose-500', 'bg-orange-500', 'bg-yellow-500', 'bg-sky-500', 'bg-emerald-500'];

                    return (
                       <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg border border-white/10">
                              {count} bài ({labels[idx]})
                          </div>

                          <div
                             className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ${colors[idx]} ${count > 0 ? 'opacity-90 hover:opacity-100' : 'opacity-20 h-[1px]'}`}
                             style={{ height: count > 0 ? `${heightPercent}%` : '1px' }}
                          ></div>
                          <div className="text-[10px] text-slate-400 mt-2 font-medium">{labels[idx]}</div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      {/* Detailed Table */}
      <div className="panel p-0 overflow-hidden print:border print:border-gray-300">
         <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-slate-400 text-sm uppercase border-b border-white/10 print:bg-gray-100 print:text-black">
               <tr>
                  <th className="p-4">Kỳ thi</th>
                  <th className="p-4 text-center">Sĩ số</th>
                  <th className="p-4 text-center">Số bài nộp</th>
                  <th className="p-4 text-center">Điểm TB</th>
                  <th className="p-4 text-center hidden sm:table-cell">Cao nhất</th>
                  <th className="p-4 text-center hidden sm:table-cell">Thấp nhất</th>
               </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5 print:divide-gray-300 print:text-black">
               {stats.map(s => (
                  <tr key={s.examId} className="hover:bg-white/5 transition-colors print:hover:bg-transparent">
                     <td className="p-4 font-medium text-white print:text-black">{s.examName}</td>
                     <td className="p-4 text-center text-slate-300 print:text-black">{s.totalStudents}</td>
                     <td className="p-4 text-center text-slate-300 print:text-black">{s.submittedCount}</td>
                     <td className={`p-4 text-center font-bold ${(s.averageScore >= 5) ? 'text-emerald-400' : 'text-rose-400'} print:text-black`}>{s.averageScore.toFixed(2)}</td>
                     <td className="p-4 text-center text-sky-300 hidden sm:table-cell print:text-black print:table-cell">{s.maxScore}</td>
                     <td className="p-4 text-center text-rose-300 hidden sm:table-cell print:text-black print:table-cell">{s.minScore}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block text-center text-sm text-gray-500 mt-8">
         Báo cáo được xuất từ hệ thống Online Exam vào ngày {new Date().toLocaleDateString('vi-VN')}
      </div>
    </div>
  );
};

export default TeacherClassReports;
