import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { classService, ClassDto } from '../services/classService';
import useAuth from '../hooks/useAuth';

const StudentClassList: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;
      try {
        const response: any = await classService.getClassesForStudent(user.id);
        console.log('API Classes Response:', response);

        let data: ClassDto[] = [];

        // Handle các trường hợp response khác nhau
        if (Array.isArray(response)) {
          // Trường hợp 1: Đã unwrap thành mảng
          data = response;
        } else if (response?.data && Array.isArray(response.data)) {
          // Trường hợp 2: Còn bọc trong object { data: [...] }
          data = response.data;
        } else if (response?.Data && Array.isArray(response.Data)) {
          // Trường hợp 3: Bọc trong { Data: [...] }
          data = response.Data;
        }


        console.log('API Response:', response);
        console.log('Parsed Data:', data);
        console.log('Is Array?', Array.isArray(data));

        if (Array.isArray(data)) {
          setClasses(data);
        } else {
          console.error("Dữ liệu lớp học không đúng định dạng:", response);
          setClasses([]);
        }
      } catch (error) {
        console.error('Không thể tải danh sách lớp học', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  // Logic tìm kiếm
  const filteredClasses = useMemo(() => {
    if (!searchTerm) return classes;
    const lower = searchTerm.toLowerCase();

    return classes.filter(c =>
      (c.name && c.name.toLowerCase().includes(lower)) ||
      (c.subject?.name && c.subject.name.toLowerCase().includes(lower)) ||
      (c.subject?.subjectCode && c.subject.subjectCode.toLowerCase().includes(lower))
    );
  }, [classes, searchTerm]);

  // Skeleton Loader Component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl h-48 p-6 flex flex-col justify-between">
           <div className="space-y-3">
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
           </div>
           <div className="space-y-2 pt-4 border-t border-white/5">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
           </div>
        </div>
      ))}
    </div>
  );

  // Debug render
  console.log('Render State -> Classes:', classes);
  console.log('Render State -> SearchTerm:', searchTerm);
  console.log('Render State -> Filtered:', filteredClasses);

  if (loading) return (
     <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/3 mb-6 animate-pulse"></div>
        <LoadingSkeleton />
     </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách các lớp đã tham gia</p>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Lớp học của tôi</h1>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           </div>
           <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Tìm lớp, môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Grid Class Cards */}
      {!Array.isArray(filteredClasses) || filteredClasses.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
           <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
           </svg>
           <h3 className="text-lg font-medium text-slate-900 dark:text-white">Chưa có lớp học nào</h3>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Bạn chưa được thêm vào lớp học nào hoặc không tìm thấy kết quả phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredClasses.map(cls => (
              <div key={cls.id} className="group flex flex-col bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:shadow-lg hover:border-emerald-500/30 transition duration-300 overflow-hidden">
                 {/* Decorative Header */}
                 <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                 <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                             {cls.subject?.subjectCode || 'Mã n/a'}
                          </p>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                             {cls.name}
                          </h3>
                       </div>
                       <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                       </div>
                    </div>

                    <div className="space-y-3 mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                           <svg className="w-4 h-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                           </svg>
                           <span>Môn: <span className="font-medium text-slate-900 dark:text-slate-200">{cls.subject?.name || 'Không xác định'}</span></span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                           <svg className="w-4 h-4 mr-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                           {/* Dùng teacherId làm fallback nếu không có object teacher */}
                           <span>GV: <span className="font-medium text-slate-900 dark:text-slate-200">{cls.teacher?.fullName || `ID: ${cls.teacherId}`}</span></span>
                        </div>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default StudentClassList;
