import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';

const TeacherExamList: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      if (user?.id) {
        try {
           const teacherId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
           if (!isNaN(teacherId)) {
             // Reuse dashboard service to get classes and exams structure
             const data = await dashboardService.getTeacherDashboardData(teacherId);

             // Extract all exams
             const allExams = (data.classes || []).flatMap(cls =>
                (cls.exams || []).map(exam => ({
                    ...exam,
                    className: cls.name,
                    classId: cls.id,
                    subjectCode: cls.subject?.subjectCode
                }))
             ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

             setExams(allExams);
           }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
      }
    };
    fetchExams();
  }, [user]);

  const filteredExams = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return exams.filter(ex =>
        ex.name.toLowerCase().includes(term) ||
        ex.className.toLowerCase().includes(term) ||
        (ex.subjectCode && ex.subjectCode.toLowerCase().includes(term))
    );
  }, [exams, searchTerm]);

  if (loading) {
    return (
       <div className="flex justify-center items-center h-64">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
       </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-6">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Quản lý Kỳ thi</h1>
                <p className="text-slate-400">Danh sách tất cả kỳ thi từ các lớp học của bạn.</p>
            </div>

            <div className="relative w-full sm:w-80">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                 </div>
                 <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors"
                    placeholder="Tìm theo tên bài thi, lớp, môn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
            </div>
        </div>

        {filteredExams.length === 0 ? (
             <div className="py-12 text-center border rounded-xl border-dashed border-slate-700 bg-slate-800/30">
                <p className="text-slate-400">{searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có kỳ thi nào.'}</p>
            </div>
        ) : (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {filteredExams.map(ex => {
                     const now = new Date();
                     const start = new Date(ex.startTime);
                     const end = new Date(ex.endTime);
                     let status = 'Sắp tới';
                     let statusColor = 'bg-sky-500/20 text-sky-400 border-sky-500/30';

                     if (now >= start && now <= end) {
                        status = 'Đang diễn ra';
                        statusColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse';
                     } else if (now > end) {
                        status = 'Đã kết thúc';
                        statusColor = 'bg-slate-500/20 text-slate-400 border-slate-500/30';
                     }

                     return (
                         <div key={ex.id} className="group panel p-5 border border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all">
                             <div className="flex justify-between items-start mb-3">
                                 <div>
                                     <span className="text-xs text-slate-400 block mb-1">{ex.className}</span>
                                     <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">{ex.name}</h3>
                                 </div>
                                 <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${statusColor}`}>
                                     {status}
                                 </span>
                             </div>

                             <div className="space-y-2 text-sm text-slate-400 mb-4">
                                 <div className="flex items-center gap-2">
                                     <span>🕒 {start.toLocaleDateString('vi-VN')} {start.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <span>⏱️ {ex.durationMinutes} phút</span>
                                 </div>
                             </div>

                             <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                                 <Link
                                    to={status === 'Đang diễn ra' ? `/teacher/classes/${ex.classId}?tab=status&examId=${ex.id}` : `/teacher/classes/${ex.classId}?tab=exams`}
                                    className="flex-1 btn btn-sm bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white hover:border-white/30"
                                 >
                                    Chi tiết
                                 </Link>
                             </div>
                         </div>
                     );
                 })}
             </div>
        )}
    </div>
  );
}

export default TeacherExamList;
