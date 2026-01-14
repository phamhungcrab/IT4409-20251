import React, { useEffect, useState, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { examService, ExamStudentStatus } from '../services/examService';
import { resultService, ResultSummary } from '../services/resultService';
import { formatLocalDateTime, formatShortDateTime, parseUtcDate } from '../utils/dateUtils';

const TeacherExamList: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Status viewing state
  const [viewingExamId, setViewingExamId] = useState<number | null>(null);
  const [viewingExamName, setViewingExamName] = useState('');
  const [examStudents, setExamStudents] = useState<ExamStudentStatus[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Student detail modal state
  const [studentDetailModal, setStudentDetailModal] = useState<{
    show: boolean;
    studentName: string;
    mssv: string;
    data: ResultSummary | null;
    loading: boolean;
    examId?: number;
    studentId?: number;
    studentStatus?: string | null;
  }>({
    show: false,
    studentName: '',
    mssv: '',
    data: null,
    loading: false
  });
  const [forceSubmitting, setForceSubmitting] = useState(false);
  const [forceSubmitState, setForceSubmitState] = useState<'idle' | 'confirm' | 'success' | 'error'>('idle');
  const [forceSubmitError, setForceSubmitError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      if (user?.id) {
        try {
           const teacherId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
           if (!isNaN(teacherId)) {
             const data = await dashboardService.getTeacherDashboardData(teacherId);
             const allExams = (data.classes || []).flatMap(cls =>
                (cls.exams || []).map(exam => ({
                    ...exam,
                    className: cls.name,
                    classId: cls.id,
                    subjectCode: cls.subject?.subjectCode
                }))
             ).sort((a, b) => (parseUtcDate(b.startTime)?.getTime() ?? 0) - (parseUtcDate(a.startTime)?.getTime() ?? 0));

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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 9 items per page (3 columns x 3 rows)

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExams.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExams, currentPage, itemsPerPage]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewStatus = async (examId: number, examName: string) => {
      setViewingExamId(examId);
      setViewingExamName(examName);
      setLoadingStatus(true);
      try {
          const res = await examService.getExamStudentsStatus(examId);
          setExamStudents(res.students);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingStatus(false);
      }
  };

  const handleViewStudentDetail = async (examId: number, studentId: number, studentName: string, mssv: string, status?: string | null) => {
    setStudentDetailModal({
        show: true,
        studentName,
        mssv,
        data: null,
        loading: true,
        examId,
        studentId,
        studentStatus: status
    });
    try {
        const result = await resultService.getResultSummary(examId, studentId);
        setStudentDetailModal(prev => ({ ...prev, data: result, loading: false }));
    } catch (error) {
        console.error(error);
        setStudentDetailModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleForceSubmit = async () => {
    if (!studentDetailModal.examId || !studentDetailModal.studentId) return;

    // If not confirmed yet, show confirmation
    if (forceSubmitState !== 'confirm') {
      setForceSubmitState('confirm');
      return;
    }

    setForceSubmitting(true);
    try {
      await examService.forceSubmit(studentDetailModal.examId, studentDetailModal.studentId);
      setForceSubmitState('success');
      // Auto close after 1.5s
      setTimeout(() => {
        setStudentDetailModal(prev => ({ ...prev, show: false }));
        setForceSubmitState('idle');
        if (viewingExamId) {
          handleViewStatus(viewingExamId, viewingExamName);
        }
      }, 1500);
    } catch (error: any) {
      setForceSubmitError(error?.message || 'Có lỗi xảy ra khi nộp bài');
      setForceSubmitState('error');
    } finally {
      setForceSubmitting(false);
    }
  };

  const handleCancelForceSubmit = () => {
    setForceSubmitState('idle');
    setForceSubmitError('');
  };

  const handleCloseModal = () => {
    setStudentDetailModal(prev => ({ ...prev, show: false }));
    setForceSubmitState('idle');
    setForceSubmitError('');
  };

  if (loading) {
    return (
       <div className="flex justify-center items-center h-64">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
       </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6">
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
                 {paginatedExams.map(ex => {
                     const now = new Date();
                     const start = parseUtcDate(ex.startTime) || new Date();
                     const end = parseUtcDate(ex.endTime) || new Date();
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
                         <div key={ex.id} className="group panel p-5 border border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all flex flex-col">
                             <div className="flex justify-between items-start mb-3">
                                 <div>
                                     <span className="text-xs text-slate-400 block mb-1">{ex.className}</span>
                                     <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">{ex.name}</h3>
                                 </div>
                                 <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${statusColor} shrink-0`}>
                                     {status}
                                 </span>
                             </div>

                             <div className="space-y-2 text-sm text-slate-400 mb-4 flex-1">
                                 <div className="flex items-center gap-2">
                                     <span>🕒 {formatShortDateTime(ex.startTime)}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <span>⏱️ {ex.durationMinutes} phút</span>
                                 </div>
                             </div>

                             <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                                 <button
                                    onClick={() => handleViewStatus(ex.id, ex.name)}
                                    className="flex-1 btn btn-sm bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white hover:border-white/30 w-full"
                                 >
                                    Chi tiết
                                 </button>
                             </div>
                         </div>
                     );
                 })}
             </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-white/10 bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              ← Trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-white/10 bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              Sau →
            </button>
          </div>
        )}

        {/* Info Text */}
        {filteredExams.length > 0 && (
          <p className="text-center text-sm text-slate-500">
            Hiển thị {paginatedExams.length} / {filteredExams.length} kỳ thi
          </p>
        )}

        {/* Modal Xem Trạng Thái */}
        {viewingExamId && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
                        <div>
                            <p className="text-sm text-slate-400">Trạng thái bài thi</p>
                            <h3 className="text-xl font-bold text-white">{viewingExamName}</h3>
                        </div>
                        <button onClick={() => setViewingExamId(null)} className="btn btn-ghost btn-sm text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="p-0 overflow-auto flex-1">
                        {loadingStatus ? (
                             <div className="py-20 text-center text-slate-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                                Đang tải dữ liệu...
                             </div>
                        ) : examStudents.length === 0 ? (
                             <div className="py-20 text-center text-slate-500">Chưa có sinh viên nào tham gia thi.</div>
                        ) : (
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="bg-white/5 text-slate-400 sticky top-0 backdrop-blur-md z-10">
                                    <tr>
                                        <th className="py-3 px-4 font-semibold">MSSV</th>
                                        <th className="py-3 px-4 font-semibold">Họ tên</th>
                                        <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                        <th className="py-3 px-4 font-semibold">Điểm</th>
                                        <th className="py-3 px-4 font-semibold">Thời gian nộp</th>
                                        <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {examStudents.map((student) => (
                                        <tr key={student.studentId} className="hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4 text-slate-300 font-mono">{student.mssv}</td>
                                            <td className="py-3 px-4 text-white font-medium">{student.studentName}</td>
                                            <td className="py-3 px-4">
                                                {student.status === 'COMPLETED' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">Hoàn thành</span>
                                                ) : student.status === 'IN_PROGRESS' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">Đang làm</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-slate-500/20 text-slate-400 px-2.5 py-1 rounded-full border border-slate-500/20">Chưa làm</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {student.score !== null ? (
                                                    <span className="font-bold text-sky-400 text-base">{student.score}</span>
                                                ) : <span className="text-slate-600">-</span>}
                                            </td>
                                            <td className="py-3 px-4 text-slate-400">
                                                {student.submittedAt ? formatLocalDateTime(student.submittedAt) : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {(student.status === 'COMPLETED' || student.status === 'IN_PROGRESS') && (
                                                    <button
                                                        onClick={() => handleViewStudentDetail(viewingExamId!, student.studentId, student.studentName, student.mssv, student.status)}
                                                        className="text-sky-400 hover:text-sky-300 hover:underline text-xs"
                                                    >
                                                        {student.status === 'IN_PROGRESS' ? 'Xem / Nộp hộ' : 'Chi tiết'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Modal Chi tiết bài thi sinh viên */}
        {studentDetailModal.show && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    >✕</button>

                    <h3 className="text-xl font-bold text-white mb-1">Kết quả bài thi</h3>
                    <p className="text-sm text-slate-400 mb-6">{studentDetailModal.studentName} ({studentDetailModal.mssv})</p>

                    {studentDetailModal.loading ? (
                        <div className="py-8 text-center text-slate-400">Đang tải...</div>
                    ) : studentDetailModal.data ? (
                        <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-lg text-center border border-white/5">
                                    <p className="text-sm text-slate-400 mb-1">Điểm số</p>
                                    <p className="text-3xl font-bold text-primary-400">{studentDetailModal.data.finalScore}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-lg text-center border border-white/5">
                                    <p className="text-sm text-slate-400 mb-1">Số câu đúng</p>
                                    <p className="text-3xl font-bold text-emerald-400">{studentDetailModal.data.correctCount}/{studentDetailModal.data.totalQuestions}</p>
                                </div>
                             </div>

                             {/* Violation Count - For Teacher Eyes Only */}
                             {(studentDetailModal.data.violationCount ?? 0) > 0 && (
                               <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
                                   <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                           <span className="text-xl">⚠️</span>
                                           <p className="text-sm font-semibold text-amber-400">Cảnh báo vi phạm</p>
                                       </div>
                                       <span className="text-2xl font-bold text-amber-400">
                                           {studentDetailModal.data.violationCount} lỗi
                                       </span>
                                   </div>
                                   <p className="text-xs text-amber-300/70 mt-2">
                                       Sinh viên đã rời khỏi màn hình thi hoặc thoát toàn màn hình quá 7 giây.
                                   </p>
                               </div>
                             )}

                             <div className="space-y-2 text-sm bg-white/5 p-4 rounded-lg border border-white/5">
                                 <div className="flex justify-between">
                                     <span className="text-slate-400">Tổng điểm câu hỏi</span>
                                     <span className="text-white">{studentDetailModal.data.totalQuestionPoint}</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-slate-400">Điểm đạt được</span>
                                     <span className="text-emerald-400 font-semibold">{studentDetailModal.data.studentEarnedPoint}</span>
                                 </div>
                             </div>

                             {/* Force Submit Section - Only show for IN_PROGRESS */}
                             {studentDetailModal.studentStatus === 'IN_PROGRESS' && (
                               <div className="mt-4 pt-4 border-t border-white/10">
                                 {/* Success State */}
                                 {forceSubmitState === 'success' && (
                                   <div className="text-center py-4">
                                     <div className="text-4xl mb-2">✅</div>
                                     <p className="text-emerald-400 font-semibold">Đã nộp bài thành công!</p>
                                     <p className="text-xs text-slate-500 mt-1">Đang đóng...</p>
                                   </div>
                                 )}

                                 {/* Error State */}
                                 {forceSubmitState === 'error' && (
                                   <div className="text-center py-4">
                                     <div className="text-4xl mb-2">❌</div>
                                     <p className="text-red-400 font-semibold">{forceSubmitError}</p>
                                     <button
                                       onClick={handleCancelForceSubmit}
                                       className="mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                                     >
                                       Thử lại
                                     </button>
                                   </div>
                                 )}

                                 {/* Confirm State */}
                                 {forceSubmitState === 'confirm' && (
                                   <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                     <p className="text-amber-300 font-semibold text-center mb-3">
                                       Bạn chắc chắn muốn nộp bài cho {studentDetailModal.studentName}?
                                     </p>
                                     <p className="text-xs text-amber-300/70 text-center mb-4">
                                       Hành động này không thể hoàn tác.
                                     </p>
                                     <div className="flex gap-3">
                                       <button
                                         onClick={handleCancelForceSubmit}
                                         className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                                       >
                                         Hủy
                                       </button>
                                       <button
                                         onClick={handleForceSubmit}
                                         disabled={forceSubmitting}
                                         className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                                       >
                                         {forceSubmitting ? (
                                           <>
                                             <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                             Đang nộp...
                                           </>
                                         ) : (
                                           'Xác nhận nộp'
                                         )}
                                       </button>
                                     </div>
                                   </div>
                                 )}

                                 {/* Idle State - Initial Button */}
                                 {forceSubmitState === 'idle' && (
                                   <>
                                     <button
                                       onClick={handleForceSubmit}
                                       className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                                     >
                                       <span>⚠️</span>
                                       Nộp bài hộ sinh viên
                                     </button>
                                     <p className="text-xs text-slate-500 text-center mt-2">
                                       Hành động này sẽ kết thúc bài thi và tính điểm cho sinh viên
                                     </p>
                                   </>
                                 )}
                               </div>
                             )}
                        </div>
                    ) : (
                        <p className="text-red-400 text-center">Không tải được dữ liệu.</p>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}

export default TeacherExamList;
