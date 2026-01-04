import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { classService, ClassDto } from '../../services/classService';

const TeacherClassList: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      if (user?.id) {
        try {
          // Parse user ID carefully
          const teacherId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
          if (!isNaN(teacherId)) {
            const data = await classService.getByTeacherAndSubject(teacherId);
            setClasses(data);
          }
        } catch (error) {
          console.error('Failed to fetch classes', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchClasses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Filter classes based on search term
  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject?.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Lớp học của bạn</h1>
                <p className="text-slate-400">Quản lý các lớp học, sinh viên và bài thi.</p>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                 </div>
                 <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors"
                    placeholder="Tìm kiếm lớp học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
            </div>
        </div>

        {filteredClasses.length === 0 ? (
             <div className="col-span-full py-12 text-center border rounded-xl border-dashed border-slate-700 bg-slate-800/30">
                <p className="text-slate-400">{searchTerm ? 'Không tìm thấy lớp học phù hợp' : 'Bạn chưa có lớp học nào.'}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
                    <Link
                        key={cls.id}
                        to={`/teacher/classes/${cls.id}`}
                        className="group panel p-0 hover:border-purple-500/30 transition-all overflow-hidden block"
                    >
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                                    {cls.name}
                                </h3>
                                <span className="text-xs bg-white/10 text-slate-300 px-2 py-1 rounded">
                                    {cls.subject?.subjectCode || 'CODE'}
                                </span>
                            </div>

                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                {cls.subject?.name || 'Môn học chưa cập nhật'}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-slate-300 border-t border-white/5 pt-4">
                                {typeof cls.studentCount === 'number' && (
                                    <span className="flex items-center gap-1.5" title="Số lượng sinh viên">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        {cls.studentCount} SV
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5" title="Số lượng kỳ thi">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {cls.exams?.length || 0} kỳ thi
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
    </div>
  );
};

export default TeacherClassList;
