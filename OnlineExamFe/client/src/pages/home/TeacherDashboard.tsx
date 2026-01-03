import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { classService, ClassDto } from '../../services/classService';

interface TeacherDashboardProps {
  user: { id?: number } | null;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [teacherClasses, setTeacherClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);
      console.log('[DEBUG] TeacherDashboard: Loading classes for user', user.id);

      try {
        const classes = await classService.getByTeacherAndSubject(user.id);
        setTeacherClasses(classes);
      } catch (err) {
        console.error('[DEBUG] TeacherDashboard: Failed to load classes', err);
        setError('Không thể tải danh sách lớp. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.id]);

  const totalStudents = teacherClasses.reduce((sum, cls) => sum + (cls.studentCount ?? 0), 0);
  const totalExams = teacherClasses.reduce((sum, cls) => sum + (cls.exams?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Lớp của bạn</h1>
          <p className="text-slate-300">Chọn lớp để quản lý sinh viên, kỳ thi và cấu trúc đề.</p>
        </div>
        <div className="glass-card px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sky-300 font-semibold">{teacherClasses.length}</span>
            <span>Lớp</span>
          </div>
          <div className="h-4 w-px bg-white/10" aria-hidden="true" />
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-emerald-300 font-semibold">{totalStudents}</span>
            <span>Sinh viên</span>
          </div>
          <div className="h-4 w-px bg-white/10" aria-hidden="true" />
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-amber-300 font-semibold">{totalExams}</span>
            <span>Kỳ thi</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-xl font-semibold text-white">Danh sách lớp</h2>
          <span className="text-sm text-slate-400">{teacherClasses.length} lớp</span>
        </div>

        {loading && <div className="text-center py-16 text-slate-400">Đang tải danh sách lớp...</div>}

        {!loading && error && (
          <div className="text-rose-200 text-sm border border-rose-400/40 bg-rose-500/10 rounded-lg p-3">
            {error}
          </div>
        )}

        {!loading && !error && teacherClasses.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-lg font-semibold text-white mb-2">Chưa có lớp nào</h3>
            <p className="text-slate-400">Liên hệ admin để được gán lớp học.</p>
          </div>
        )}

        {!loading && !error && teacherClasses.length > 0 && (
          <div className="space-y-3">
            {teacherClasses.map((cls) => (
              <button
                key={cls.id}
                onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                className="w-full text-left p-4 rounded-xl border transition-all duration-200 bg-white/5 border-white/10 hover:border-sky-500/40 hover:bg-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-semibold text-white text-base mb-1">{cls.name}</h3>
                    <p className="text-sm text-sky-300">
                      {cls.subject?.name || `Môn #${cls.subjectId}`}
                    </p>
                  </div>
                  <span className="shrink-0 bg-sky-500/20 text-sky-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {cls.subject?.subjectCode || 'N/A'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>{cls.studentCount ?? 0} sinh viên</span>
                  <span>{cls.exams?.length ?? 0} kỳ thi</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Nhấn để quản lý lớp</span>
                  <span className="text-sky-300 font-semibold">Xem chi tiết →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
