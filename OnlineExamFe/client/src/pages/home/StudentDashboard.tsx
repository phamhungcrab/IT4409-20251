import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { StudentExamDto } from '../../types/exam';

/**
 * StudentDashboardProps:
 * - Props truyền vào StudentDashboard.
 *
 * user:
 * - Thông tin sinh viên đang đăng nhập.
 * - Hiện đang dùng any (TypeScript không kiểm tra chặt).
 * - Về sau nên tạo UserDto để tránh bug (vd: user.id không tồn tại).
 */
interface StudentDashboardProps {
  user: any;
}

/**
 * StudentDashboard:
 *
 * Đây là trang “bảng điều khiển” dành cho sinh viên, mục tiêu:
 * 1) Hiển thị thông báo (announcements) liên quan tới người dùng
 * 2) Lấy và hiển thị danh sách bài thi của sinh viên (upcomingExams)
 * 3) Lấy và hiển thị kết quả gần đây (results)
 *
 * Cách hoạt động chung:
 * - Khi có user.id -> gọi API để lấy exams + results
 * - Lưu vào state -> React render UI theo state đó
 */
const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [upcomingExams, setUpcomingExams] = useState<StudentExamDto[]>([]);

  // Chỉ tải bài thi, không cần tải result ở đây nữa cho nhẹ
  useEffect(() => {
    const fetchStudentData = async () => {
      if (user && user.id) {
        try {
          const examsData = await examService.getStudentExams(user.id);
          setUpcomingExams(examsData);
        } catch (err) {
          console.error('Không thể tải dữ liệu dashboard của sinh viên', err);
        }
      }
    };
    fetchStudentData();
  }, [user]);

  // Lấy tối đa 3 bài thi đầu tiên để hiển thị nhanh
  const previewExams = upcomingExams.slice(0, 3);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-200/70">
            Xin chào {user?.fullName || 'Sinh viên'}
          </p>
          <h1 className="text-3xl font-semibold text-white mt-1">
            Tổng quan học tập
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Bạn có <span className="text-emerald-400 font-bold">{upcomingExams.length}</span> bài thi được giao.
          </p>
        </div>

        <div className="glass-card px-6 py-4 flex items-center gap-4">
           <Link to="/exams" className="btn btn-primary px-6 py-3 shadow-lg shadow-sky-500/20">
              Xem tất cả bài thi →
           </Link>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-3 mt-6">
        {/* CỘT TRÁI (2 phần): Hiển thị nhanh vài bài thi sắp tới */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Bài thi gần đây</h2>
            <Link to="/exams" className="text-sm text-sky-400 hover:text-sky-300 hover:underline">
              Xem toàn bộ
            </Link>
          </div>

          {previewExams.length > 0 ? (
            <div className="space-y-4">
              {previewExams.map((exam) => (
                <div
                  key={exam.examId}
                  className="panel p-4 flex items-center justify-between hover:bg-white/5 transition-colors border border-white/10 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-800 border border-white/10 text-white font-bold text-lg">
                        {exam.examName ? exam.examName.slice(0, 1).toUpperCase() : 'E'}
                     </div>
                     <div>
                        <h3 className="text-lg font-medium text-white">{exam.examName}</h3>
                        <div className="text-sm text-slate-400 flex gap-3 mt-1">
                           <span>⏱ {exam.durationMinutes} phút</span>
                           <span className="text-slate-600">|</span>
                           <span>📅 {new Date(exam.startTime).toLocaleDateString('vi-VN')}</span>
                        </div>
                     </div>
                  </div>

                  <Link to="/exams" className="btn btn-ghost border border-white/20 text-sm">
                    Xem chi tiết
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 bg-white/5 rounded-xl border border-white/5 border-dashed">
               🎉 Bạn hiện không có bài thi nào!
            </div>
          )}
        </div>

        {/* CỘT PHẢI (1 phần): Thống kê hoặc menu nhanh */}
        <div className="glass-card p-6 flex flex-col gap-4">
           <h2 className="text-lg font-semibold text-white">Menu nhanh</h2>

           <Link to="/results" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group">
              <div className="text-emerald-400 font-medium mb-1 group-hover:text-emerald-300">Kết quả thi</div>
              <p className="text-xs text-slate-400">Xem lại điểm số và lịch sử làm bài của bạn.</p>
           </Link>


        </div>
      </section>
    </>
  );
};

export default StudentDashboard;

/**
 * Giải thích các khái niệm dễ vấp (người mới):
 *
 * 1) useEffect dùng để làm gì?
 * - Dùng để chạy “tác vụ phụ” sau khi render, ví dụ gọi API lấy dữ liệu.
 * - Nếu không có useEffect, bạn không nên gọi API trực tiếp trong phần return JSX.
 *
 * 2) Vì sao phải kiểm tra (user && user.id)?
 * - Vì lúc mới vào app, user có thể chưa có ngay.
 * - Nếu gọi API với user.id = undefined sẽ gây lỗi request hoặc crash.
 *
 * 3) Link khác gì so với thẻ <a>?
 * - <a href="..."> sẽ reload cả trang (tải lại từ đầu).
 * - <Link to="..."> của react-router chuyển trang trong SPA, nhanh hơn và không mất state toàn app.
 *
 * 4) Vì sao tên biến là upcomingExams nhưng dữ liệu có thể không “upcoming”?
 * - API getStudentExams có thể trả cả bài thi đã bắt đầu/đã kết thúc.
 * - Nếu bạn muốn đúng “sắp tới”, bạn có thể lọc:
 *   exams.filter(ex => new Date(ex.startTime) > new Date())
 */
