import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { classService } from '../services/classService';
import { subjectService, SubjectDto } from '../services/subjectService';

const StudentSubjectList: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // 1. Lấy danh sách lớp trước để biết sinh viên học môn nào
        // Lưu ý: data trả về có thể là mảng hoặc bọc trong object, cần xử lý như StudentClassList
        const classRes: any = await classService.getClassesForStudent(user.id);

        let classData: any[] = [];
        if (Array.isArray(classRes)) {
            classData = classRes;
        } else if (classRes?.data && Array.isArray(classRes.data)) {
            classData = classRes.data;
        }

        // 2. Lọc ra các subjectId duy nhất (loại bỏ null/undefined)
        // Giả sử mỗi class có field 'subjectId'
        const subjectIds = Array.from(new Set(classData.map((c) => c.subjectId).filter((id) => !!id)));

        // 3. Gọi API lấy chi tiết môn học cho từng ID
        if (subjectIds.length > 0) {
           const subjectPromises = subjectIds.map(id => subjectService.getSubjectById(id));
           // Dùng Promise.allSettled để tránh chết cả trang nếu 1 môn bị lỗi 404
           const results = await Promise.allSettled(subjectPromises);

           const fetchedSubjects: SubjectDto[] = [];
           results.forEach(res => {
               if (res.status === 'fulfilled') {
                   // Cần check data bọc hay không bọc
                   const sData: any = res.value;
                   if (sData?.id) fetchedSubjects.push(sData);
                   else if (sData?.data?.id) fetchedSubjects.push(sData.data);
               }
           });
           setSubjects(fetchedSubjects);
        } else {
            setSubjects([]);
        }

      } catch (error) {
        console.error('Lỗi tải danh sách môn học:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, [user]);

  // Loading UI
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
           {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10"></div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách các môn đang học</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Môn học của tôi</h1>
      </div>

      {subjects.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
           <div className="text-5xl mb-4">📚</div>
           <h3 className="text-lg font-medium text-slate-900 dark:text-white">Chưa có môn học nào</h3>
           <p className="text-slate-500 dark:text-slate-400 mt-1">
             Hệ thống chưa tìm thấy thông tin môn học từ các lớp bạn tham gia.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div key={sub.id} className="group relative bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300">
               {/* Decorative Gradient Top */}
               <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:h-2 transition-all duration-300"></div>

               <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                        {sub.subjectCode}
                     </span>
                     <div className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                     </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                     {sub.name}
                  </h3>

                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                     <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                     </svg>
                     <span>Tổng số chương: <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.totalChapters}</span></span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSubjectList;
