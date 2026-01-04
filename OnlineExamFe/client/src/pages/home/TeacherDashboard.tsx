import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { dashboardService, TeacherDashboardData } from '../../services/dashboardService';
import ExamMonitorCard from '../../components/dashboard/ExamMonitorCard';
import ClassSpotlightCard from '../../components/dashboard/ClassSpotlightCard';
import DashboardSearch from '../../components/dashboard/DashboardSearch';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (user?.role === 'Teacher' && user.id) {
      // Ép kiểu user.id sang number nếu cần, tuy nhiên mock user id thường là string hoặc number
      // Trong dashboardService đang nhận number. Hãy đảm bảo user.id hợp lệ.
      // Tạm thời parse
      const teacherId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      if (!isNaN(teacherId)) {
        const result = await dashboardService.getTeacherDashboardData(teacherId);
        setData(result);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh exam monitor every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400">{user?.fullName || 'Teacher'}</span>! 👋
          </h1>
          <p className="text-slate-400">
             Hôm nay bạn có <strong className="text-white">{data?.examMonitor.live.length || 0} kỳ thi đang diễn ra</strong>.
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex gap-4 p-1 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="px-4 py-2 text-center border-r border-white/10">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Sinh viên</div>
                <div className="text-xl font-bold text-white">{data?.overview.totalStudents || 0}</div>
            </div>
            <div className="px-4 py-2 text-center border-r border-white/10">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Lớp học</div>
                <div className="text-xl font-bold text-white">{data?.overview.totalClasses || 0}</div>
            </div>
            <div className="px-4 py-2 text-center">
                <div className="text-xs text-slate-400 uppercase tracking-wider">Kỳ thi</div>
                <div className="text-xl font-bold text-white">{data?.overview.totalExams || 0}</div>
            </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[500px]">
        {/* 2. Exam Monitor (Kỳ thi) - Priority 2 */}
        <div className="lg:col-span-6 h-full">
            <ExamMonitorCard
                upcoming={data?.examMonitor.upcoming || []}
                live={data?.examMonitor.live || []}
                isLoading={loading}
            />
        </div>

        {/* 3. Class Spotlight (Lớp nổi bật) - Priority 3 */}
        <div className="lg:col-span-6 h-full">
            <ClassSpotlightCard classes={data?.classSpotlight || []} isLoading={loading} />
        </div>
      </div>

      {/* 4. Quick Search & Directory */}
      <div className="mt-8">
         <DashboardSearch classes={data?.classes || []} />
      </div>
    </div>
  );
};

export default TeacherDashboard;
