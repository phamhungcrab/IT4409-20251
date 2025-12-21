import React, { useState, useEffect } from 'react';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import ResultTable, { ResultItem } from '../../components/ResultTable';
import { Link } from 'react-router-dom';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { examService } from '../../services/examService';
import { resultService } from '../../services/resultService';
import { ExamDto } from '../../types/exam';

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
  /**
   * useAnnouncements(user):
   * - Hook tự viết để lấy danh sách thông báo.
   * - Truyền user vào để hook có thể lọc thông báo theo role/đối tượng (tuỳ thiết kế hệ thống).
   *
   * announcements:
   * - Mảng các thông báo để đưa vào AnnouncementBanner.
   */
  const { announcements } = useAnnouncements(user);

  /**
   * upcomingExams:
   * - Danh sách bài thi của sinh viên (bạn đang gọi getStudentExams).
   * - Trong UI bạn gọi là “bài thi sắp tới”, nhưng dữ liệu có thể bao gồm nhiều trạng thái.
   * - Nếu muốn “sắp tới” đúng nghĩa, bạn có thể lọc thêm theo thời gian startTime > now.
   */
  const [upcomingExams, setUpcomingExams] = useState<ExamDto[]>([]);

  /**
   * results:
   * - Danh sách kết quả thi của sinh viên.
   * - Được render qua component ResultTable.
   */
  const [results, setResults] = useState<ResultItem[]>([]);

  /**
   * useEffect: tải dữ liệu dashboard cho sinh viên.
   *
   * Khi nào chạy?
   * - Chạy lần đầu khi component render.
   * - Chạy lại khi user thay đổi (dependency [user]).
   *
   * Vì sao phụ thuộc user?
   * - Vì user có thể null lúc app mới load (đang khôi phục session).
   * - Khi user có rồi thì mới gọi API (tránh gọi với user.id undefined).
   */
  useEffect(() => {
    const fetchStudentData = async () => {
      // Chỉ gọi API khi có user và user.id
      if (user && user.id) {
        try {
          /**
           * 1) Lấy danh sách bài thi của sinh viên
           * - examService.getStudentExams(user.id) thường trả về mảng ExamDto[]
           */
          const examsData = await examService.getStudentExams(user.id);
          setUpcomingExams(examsData);

          /**
           * 2) Lấy danh sách kết quả thi của sinh viên
           * - resultService.getResultsByStudent(user.id) trả về mảng ResultItem[]
           */
          const resultsData = await resultService.getResultsByStudent(user.id);
          setResults(resultsData);
        } catch (err) {
          /**
           * Nếu API lỗi (mạng/BE lỗi/permission) thì log ra để debug.
           * Gợi ý:
           * - Về UI bạn có thể thêm state error để hiển thị thông báo đẹp hơn cho người dùng.
           */
          console.error('Không thể tải dữ liệu dashboard của sinh viên', err);
        }
      }
    };

    fetchStudentData();
  }, [user]);

  return (
    <>
      {/* =========================
          PHẦN 1: Header chào + thống kê nhanh
          ========================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {/* Dòng chào (trang trí) */}
          <p className="text-sm uppercase tracking-[0.35em] text-sky-200/70">
            Chào mừng bạn quay lại
          </p>

          {/* Tiêu đề chính */}
          <h1 className="text-3xl font-semibold text-white mt-1">
            Bảng điều khiển kỳ thi của bạn
          </h1>

          {/* Mô tả ngắn */}
          <p className="text-sm text-slate-300 mt-2">
            Theo dõi thông báo, bài thi sắp tới và kết quả tại một nơi.
          </p>
        </div>

        {/* Thẻ thống kê số bài thi (nhìn nhanh) */}
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          {/* Hình tròn hiển thị số lượng bài thi */}
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-200 font-semibold">
            {upcomingExams.length}
          </div>

          <div>
            <p className="text-xs text-slate-300">Bài thi sắp tới</p>

            {/* Nếu có bài thi thì hiển thị “Sẵn sàng”, không có thì “Không có bài thi” */}
            <p className="text-lg font-semibold text-white">
              {upcomingExams.length > 0 ? 'Sẵn sàng làm bài' : 'Không có bài thi'}
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          PHẦN 2: Banner thông báo
          ========================= */}
      <AnnouncementBanner announcements={announcements} />

      {/* =========================
          PHẦN 3: 2 cột - Lịch bài thi + Kết quả gần đây
          ========================= */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* CỘT TRÁI: Danh sách bài thi */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-300">Lịch</p>
              <h2 className="text-xl font-semibold text-white">Bài thi sắp tới</h2>
            </div>

            {/* Tag “Đang cập nhật” chỉ mang tính trang trí */}
            <span className="tag">
              <span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden />
              Đang cập nhật
            </span>
          </div>

          {/* Nếu có bài thi thì render danh sách, nếu không thì báo “không có” */}
          {upcomingExams.length > 0 ? (
            <ul className="space-y-3">
              {upcomingExams.map((exam) => (
                <li
                  key={exam.id}
                  className="panel p-4 flex items-start gap-3 hover:border-white/30"
                >
                  {/* Avatar chữ cái: lấy 2 ký tự đầu của tên bài thi */}
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-sky-500/20 text-white font-semibold">
                    {exam.name ? exam.name.slice(0, 2).toUpperCase() : 'EX'}
                  </div>

                  {/* Nội dung chính */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{exam.name}</h3>
                    <p className="text-sm text-slate-300">
                      Bắt đầu: {new Date(exam.startTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-300">
                      Kết thúc: {new Date(exam.endTime).toLocaleString()}
                    </p>
                  </div>

                  {/**
                   * Link:
                   * - Link của react-router-dom giúp chuyển trang “không reload”.
                   * - Tại đây bạn đang dẫn trực tiếp tới /exam/:id
                   *
                   * Lưu ý quan trọng:
                   * - Ở flow dự án trước của bạn, vào phòng thi thường cần đi qua startExam
                   *   để lấy wsUrl + questions (location.state).
                   * - Nếu vào thẳng bằng Link như thế này, ExamRoomPage phải có “recovery logic”
                   *   (bạn đã có) để tự gọi API và lấy lại state.
                   */}
                  <Link to={`/exam/${exam.id}`} className="btn btn-primary text-sm">
                    Vào làm bài
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-300">Hiện không có bài thi sắp tới.</p>
          )}
        </div>

        {/* CỘT PHẢI: Kết quả gần đây */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-300">Thành tích</p>
              <h2 className="text-xl font-semibold text-white">Kết quả gần đây</h2>
            </div>

            {/* Tag “Đã cập nhật” chỉ mang tính trang trí */}
            <span className="tag">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              Đã cập nhật
            </span>
          </div>

          {/* ResultTable là component con, nhận results[] để render bảng */}
          <ResultTable results={results} />
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
