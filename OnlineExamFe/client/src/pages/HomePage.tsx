import React from 'react';
import useAuth from '../hooks/useAuth';
import { UserRole } from '../services/authService';
import StudentDashboard from './home/StudentDashboard';
import TeacherDashboard from './home/TeacherDashboard';

/**
 * HomePage (Trang Dashboard):
 *  - Đây là trang “trang chủ” sau khi người dùng đăng nhập.
 *  - Tùy theo role của user, trang sẽ hiển thị giao diện khác nhau:
 *      + Student: StudentDashboard
 *      + Teacher: TeacherDashboard
 */
const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {user?.role === UserRole.Teacher ? (
        <TeacherDashboard user={user} />
      ) : (
        <StudentDashboard user={user} />
      )}
    </div>
  );
};

export default HomePage;
