import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { classService, ClassDto } from '../services/classService';
import useAuth from '../hooks/useAuth';
import { formatLocalDateTime } from '../utils/dateUtils';

interface StudentDto {
  id: number;
  fullName: string;
  email: string;
  mssv: string;
  dateOfBirth?: string;
}

type Tab = 'members' | 'exams';

const StudentClassDetail: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const numericClassId = Number(classId);
  const [classDetail, setClassDetail] = useState<ClassDto | null>(null);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Grid 3x3

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!numericClassId || isNaN(numericClassId)) return;

      setLoading(true);
      try {
        const [classData, studentsData] = await Promise.all([
          classService.getById(numericClassId),
          classService.getStudentsByClass(numericClassId)
        ]);

        setClassDetail(classData);
        setStudents(studentsData);
      } catch (err) {
        console.error('Failed to load class detail', err);
        setError('Không thể tải thông tin lớp học');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [numericClassId]);

  if (loading) {
     return (
        <div className="max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
           <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-slate-400">Đang tải thông tin lớp học...</p>
        </div>
     );
  }

  if (error || !classDetail) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center">
           <h3 className="text-xl font-bold text-rose-500 mb-2">Đã có lỗi xảy ra</h3>
           <p className="text-slate-400 mb-4">{error || 'Không tìm thấy lớp học'}</p>
           <button onClick={() => navigate('/student/classes')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
              Quay lại danh sách
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Info */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-64 h-64 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
          </div>

          <button
             onClick={() => navigate('/student/classes')}
             className="mb-6 flex items-center text-slate-400 hover:text-white transition-colors group"
          >
             <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
             Quay lại danh sách
          </button>

          <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                              {classDetail.subject?.subjectCode || 'CLASS'}
                          </span>
                          <span className="text-slate-400 text-sm font-medium">
                              {classDetail.subject?.name}
                          </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                          {classDetail.name}
                      </h1>

                      <div className="flex items-center gap-6 text-slate-300">
                          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-sm">GV: <span className="font-semibold text-white">{classDetail.teacher?.fullName || classDetail.teacherName || '...'}</span></span>
                          </div>

                          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                              <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              <span className="text-sm">Sĩ số: <span className="font-semibold text-white">{students.length}</span></span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
         <div className="flex gap-8">
            <button
               onClick={() => { setActiveTab('members'); setCurrentPage(1); }}
               className={`pb-4 text-sm font-medium transition-colors relative ${
                  activeTab === 'members'
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-300'
               }`}
            >
               Thành viên lớp
               {activeTab === 'members' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
               )}
            </button>

            <button
               onClick={() => { setActiveTab('exams'); setCurrentPage(1); }}
               className={`pb-4 text-sm font-medium transition-colors relative ${
                  activeTab === 'exams'
                  ? 'text-emerald-400'
                  : 'text-slate-400 hover:text-slate-300'
               }`}
            >
               Danh sách kỳ thi
               {activeTab === 'exams' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
               )}
            </button>
         </div>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
          {(() => {
              const dataList = activeTab === 'members' ? students : (classDetail?.exams || []);
              const totalPages = Math.ceil(dataList.length / itemsPerPage);
              const currentData = dataList.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
              );

              return (
                  <>
                      {activeTab === 'members' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {(currentData as StudentDto[]).map(student => (
                                 <div key={student.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                       {student.fullName.charAt(0)}
                                    </div>
                                    <div>
                                       <h4 className="font-semibold text-slate-200">{student.fullName}</h4>
                                       <p className="text-xs text-slate-400 font-mono">{student.mssv}</p>
                                    </div>
                                    {user?.id === student.id && (
                                       <span className="ml-auto px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">
                                          Bạn
                                       </span>
                                    )}
                                 </div>
                              ))}
                              {students.length === 0 && (
                                  <div className="col-span-full text-center py-12 text-slate-500">
                                      Chưa có thành viên nào trong lớp
                                  </div>
                              )}
                          </div>
                      )}

                      {activeTab === 'exams' && (
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                               {(currentData as any[]).length > 0 ? (
                                   (currentData as typeof classDetail.exams).map(exam => (
                                       <div key={exam.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/30 transition-all group flex flex-col justify-between h-full">
                                           <div>
                                               <div className="flex justify-between items-start gap-2 mb-2">
                                                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                                                      {exam.name}
                                                  </h3>
                                               </div>

                                               <div className="flex flex-col gap-2 mt-2 text-sm text-slate-400">
                                                   <div className="flex items-center gap-2">
                                                       <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                       </svg>
                                                       <span className="font-medium text-slate-300">{exam.durationMinutes} phút</span>
                                                   </div>
                                                   <div className="flex items-center gap-2">
                                                       <svg className="w-4 h-4 shrink-0 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                       </svg>
                                                       <span className="truncate">{formatLocalDateTime(exam.startTime)} - {formatLocalDateTime(exam.endTime)}</span>
                                                   </div>
                                               </div>
                                           </div>

                                           <button
                                              onClick={() => navigate(`/exam/${exam.id}`)}
                                              className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
                                           >
                                              Vào thi
                                           </button>
                                       </div>
                                   ))
                               ) : (
                                   <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-700/50 rounded-xl">
                                       <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                           <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                           </svg>
                                       </div>
                                       <h3 className="text-lg font-medium text-slate-300">Chưa có kỳ thi nào</h3>
                                       <p className="text-slate-500 mt-1">Hiện tại lớp học chưa có bài thi nào được tạo.</p>
                                   </div>
                               )}
                           </div>
                      )}

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                          <div className="flex justify-center mt-8 gap-2">
                              <button
                                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                  disabled={currentPage === 1}
                                  className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                              </button>

                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                  <button
                                      key={page}
                                      onClick={() => setCurrentPage(page)}
                                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                          currentPage === page
                                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                              : 'border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                                      }`}
                                  >
                                      {page}
                                  </button>
                              ))}

                              <button
                                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={currentPage === totalPages}
                                  className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                              </button>
                          </div>
                      )}
                  </>
              );
          })()}
      </div>

    </div>
  );
};

export default StudentClassDetail;
