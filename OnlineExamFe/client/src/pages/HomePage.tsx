import React from 'react';
import useAuth from '../hooks/useAuth';
import { UserRole } from '../services/authService';
import StudentDashboard from './home/StudentDashboard';
import TeacherDashboard from './home/TeacherDashboard';

/**
 * HomePage (Trang Dashboard / Trang chủ sau khi đăng nhập)
 *
 * Mục đích:
 * - Đây là trang mà người dùng nhìn thấy sau khi đăng nhập thành công.
 * - Trang này sẽ hiển thị “bảng điều khiển” (dashboard) khác nhau tùy theo vai trò (role).
 *
 * Quy tắc hiển thị:
 * - Nếu user.role là Teacher  -> hiển thị TeacherDashboard
 * - Nếu không phải Teacher    -> mặc định hiển thị StudentDashboard
 *
 * Lưu ý cho người mới:
 * - Đây là cách phân nhánh giao diện theo role rất phổ biến trong web app.
 * - Thông thường app sẽ có nhiều role hơn (Admin/Teacher/Student...), khi đó bạn có thể mở rộng if/else.
 */
const HomePage: React.FC = () => {
  /**
   * useAuth():
   * - Đây là custom hook (hook tự viết).
   * - Nhiệm vụ: cung cấp thông tin đăng nhập hiện tại cho toàn app.
   * - Ở đây mình lấy ra user để biết “ai đang đăng nhập” và “role là gì”.
   *
   * user có thể là:
   * - null/undefined: chưa đăng nhập hoặc dữ liệu user chưa kịp tải
   * - object: có dữ liệu user (id, email, role, ...)
   */
  const { user } = useAuth();

  return (
    /**
     * div ngoài cùng:
     * - max-w-6xl mx-auto: giới hạn chiều rộng và canh giữa trang
     * - p-6: padding (khoảng cách bên trong)
     * - space-y-8: các khối con cách nhau theo chiều dọc
     */
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/**
       * Toán tử điều kiện 3 ngôi (ternary operator):
       *
       * Cú pháp:
       *   điều_kiện ? giá_trị_nếu_đúng : giá_trị_nếu_sai
       *
       * Ở đây:
       * - Nếu user?.role === UserRole.Teacher => render TeacherDashboard
       * - Ngược lại => render StudentDashboard
       *
       * Giải thích dấu "?."
       * - user?.role gọi là "optional chaining"
       * - Nghĩa là: nếu user đang null/undefined thì không truy cập role nữa để tránh lỗi.
       * - Nếu user chưa có, biểu thức user?.role sẽ trả về undefined thay vì crash app.
       */}
      {user?.role === UserRole.Teacher ? (
        /**
         * TeacherDashboard:
         * - Component dashboard dành cho giáo viên
         * - Truyền user xuống để dashboard biết người đang đăng nhập là ai
         */
        <TeacherDashboard user={user} />
      ) : (
        /**
         * StudentDashboard:
         * - Component dashboard dành cho học sinh
         * - Truyền user xuống tương tự
         */
        <StudentDashboard user={user} />
      )}
    </div>
  );
};

export default HomePage;
