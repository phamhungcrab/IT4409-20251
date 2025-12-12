/**
 * HomePage (Trang Dashboard):
 *  - Đây là trang “trang chủ” sau khi người dùng đăng nhập.
 *  - Tùy theo role của user, trang sẽ hiển thị giao diện khác nhau:
 *      + Student: thông báo, bài thi sắp tới, bảng kết quả gần đây.
 *      + Teacher: dashboard quản lý lớp, xem danh sách sinh viên, tạo bài thi,
 *                xem các bài thi thuộc lớp mà giáo viên phụ trách.
 *
 * Lưu ý quan trọng:
 *  - Phần Student trong code hiện đang dùng dữ liệu mẫu (mock) để demo UI.
 *  - Phần Teacher đã gọi API thật qua classService và examService.
 */

import React, { useState, useEffect } from 'react';
import AnnouncementBanner, { Announcement } from '../components/AnnouncementBanner';
import ResultTable, { ResultItem } from '../components/ResultTable';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { UserRole } from '../services/authService';
import { classService, ClassDto } from '../services/classService';
import { examService } from '../services/examService';

/**
 * UpcomingExam:
 *  - Kiểu dữ liệu dùng cho danh sách “bài thi sắp tới” của Student.
 *  - startTime/endTime là Date để hiển thị nhanh trên UI.
 */
interface UpcomingExam {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
}

/**
 * StudentDto:
 *  - Kiểu dữ liệu tối thiểu để hiển thị danh sách sinh viên trong một lớp (Teacher view).
 */
interface StudentDto {
  id: number;
  fullName: string;
  email: string;
  mssv: string;
}

const HomePage: React.FC = () => {
  /**
   * useAuth:
   *  - user: người dùng hiện tại (id/email/role)
   *  - Nếu user = null: chưa đăng nhập hoặc vừa logout.
   */
  const { user } = useAuth();

  // =========================
  // STATE CHUNG CHO MỌI ROLE
  // =========================

  /**
   * announcements:
   *  - Danh sách thông báo hiển thị ở banner.
   *  - Student hiện đang set dữ liệu mẫu.
   *  - Teacher hiện đang để rỗng (có thể nối API thật về sau).
   */
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // =========================
  // STATE CHO STUDENT
  // =========================

  /**
   * upcomingExams:
   *  - Danh sách bài thi sắp tới của Student.
   *  - Hiện đang dùng mock để demo.
   */
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);

  /**
   * results:
   *  - Danh sách kết quả gần đây của Student.
   *  - Hiện đang dùng mock để demo.
   */
  const [results, setResults] = useState<ResultItem[]>([]);

  // =========================
  // STATE CHO TEACHER
  // =========================

  /**
   * teacherClasses:
   *  - Danh sách lớp mà giáo viên hiện tại phụ trách.
   *  - Lấy từ API: classService.getByTeacherAndSubject(teacherId)
   */
  const [teacherClasses, setTeacherClasses] = useState<ClassDto[]>([]);

  /**
   * teacherExams:
   *  - Danh sách bài thi thuộc các lớp mà giáo viên phụ trách.
   *  - Lấy bằng cách:
   *      1) gọi examService.getAllExams()
   *      2) lọc lại theo classIds của teacherClasses
   *
   * Hiện đang để any[] vì dữ liệu exam chưa typing chặt.
   * (Nên cải thiện bằng ExamDto cho sạch code.)
   */
  const [teacherExams, setTeacherExams] = useState<any[]>([]);

  /**
   * selectedClassStudents:
   *  - Danh sách sinh viên của lớp đang được giáo viên chọn để xem.
   */
  const [selectedClassStudents, setSelectedClassStudents] = useState<StudentDto[]>([]);

  /**
   * viewingClassId:
   *  - id lớp mà giáo viên đang xem danh sách sinh viên.
   *  - null nghĩa là chưa chọn lớp nào.
   */
  const [viewingClassId, setViewingClassId] = useState<number | null>(null);

  /**
   * useEffect #1 (khởi tạo dữ liệu theo role):
   *  - Khi user thay đổi, xác định role để set dữ liệu phù hợp.
   *
   * Hiện tại:
   *  - Student (hoặc user null): set mock announcements + upcomingExams + results
   *  - Teacher: clear announcements (tránh bị dính mock Student)
   */
  useEffect(() => {
    // Xác định role để chuẩn bị dữ liệu hiển thị
    if (user?.role === UserRole.Student || !user) {
      // Thông báo mẫu cho Student
      setAnnouncements([
        { id: 1, message: 'Chào mừng bạn đến với Hệ thống Thi Trực tuyến!', type: 'success' },
        { id: 2, message: 'Hãy kiểm tra các bài thi sắp tới bên dưới.', type: 'info' }
      ]);

      // Bài thi sắp tới (mock)
      setUpcomingExams([
        {
          id: 101,
          title: 'Mathematics Midterm',
          // 2 ngày nữa
          startTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
          // 2 ngày nữa + 90 phút
          endTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000)
        },
        {
          id: 102,
          title: 'History Quiz',
          // 5 ngày nữa
          startTime: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
          // 5 ngày nữa + 60 phút
          endTime: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
        }
      ]);

      // Kết quả gần đây (mock)
      setResults([
        {
          id: 201,
          examTitle: 'Science Test',
          objectiveScore: 8.5,
          subjectiveScore: 7.5,
          totalScore: 16.0,
          status: 'Completed'
        },
        {
          id: 202,
          examTitle: 'English Placement',
          objectiveScore: 9.0,
          subjectiveScore: 8.0,
          totalScore: 17.0,
          status: 'Completed'
        }
      ]);
    } else if (user?.role === UserRole.Teacher) {
      // Teacher view: xóa announcements kiểu Student để tránh hiển thị sai
      setAnnouncements([]);
    }
  }, [user]);

  /**
   * useEffect #2 (tải dữ liệu Teacher từ API thật):
   *  - Chỉ chạy khi user là Teacher.
   *  - Tải:
   *      1) Danh sách lớp của giáo viên
   *      2) Danh sách bài thi thuộc các lớp đó (lọc từ all exams)
   */
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (user?.role === UserRole.Teacher && user.id) {
        try {
          // 1) Lấy các lớp mà teacher phụ trách
          const classes = await classService.getByTeacherAndSubject(user.id);
          setTeacherClasses(classes);

          // 2) Lấy tất cả exam rồi lọc theo classId của teacherClasses
          const allExams = await examService.getAllExams();
          const classIds = new Set(classes.map((c) => c.id));
          const filteredExams = allExams.filter((ex: any) => classIds.has(ex.classId));
          setTeacherExams(filteredExams);
        } catch (error) {
          console.error('Không thể tải dữ liệu lớp/bài thi của giáo viên', error);
        }
      }
    };

    fetchTeacherData();
  }, [user]);

  /**
   * handleViewStudents:
   *  - Khi giáo viên bấm “View Users” ở một lớp, gọi API lấy danh sách sinh viên trong lớp.
   *  - Sau đó hiển thị bảng sinh viên ở khung bên phải.
   */
  const handleViewStudents = async (classId: number) => {
    try {
      setViewingClassId(classId);
      const students = await classService.getStudentsByClass(classId);
      setSelectedClassStudents(students);
    } catch (error) {
      console.error('Không thể tải danh sách sinh viên', error);
      alert('Không thể tải danh sách sinh viên.');
    }
  };

  /**
   * handleCreateExam:
   *  - Khi giáo viên bấm “+ Create Exam” ở một lớp:
   *      1) Hỏi tên bài thi (prompt)
   *      2) Hỏi thời lượng (phút)
   *      3) Hỏi blueprintId
   *      4) Gọi API tạo exam
   *      5) Nếu thành công: append exam mới vào teacherExams để UI cập nhật.
   *
   * Lưu ý:
   *  - prompt chỉ phù hợp demo. Thực tế nên dùng modal form đẹp hơn.
   */
  const handleCreateExam = async (classId: number) => {
    const examName = prompt('Nhập tên bài thi:');
    if (!examName) return;

    const durationStr = prompt('Nhập thời lượng (phút):', '60');
    const duration = parseInt(durationStr || '60', 10);

    const blueprintStr = prompt('Nhập Blueprint ID (bắt buộc):', '1');
    const blueprintId = parseInt(blueprintStr || '1', 10);

    try {
      const newExam = await examService.createExam({
        name: examName,
        classId,
        blueprintId,
        durationMinutes: duration,
        // start/end dùng ISO string để backend dễ xử lý
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      alert('Tạo bài thi thành công!');

      // Cập nhật UI: thêm exam mới vào danh sách hiện tại
      setTeacherExams((prev) => [...prev, newExam]);
    } catch (err) {
      alert('Tạo bài thi thất bại. Hãy kiểm tra Blueprint ID / Class ID.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {user?.role === UserRole.Teacher ? (
        // ============================
        // TEACHER DASHBOARD (GIAO DIỆN GIÁO VIÊN)
        // ============================
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">Teacher Dashboard</h1>
            <p className="text-slate-300">Quản lý lớp và bài thi</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Danh sách lớp của giáo viên */}
            <div className="glass-card p-5">
              <h2 className="text-xl font-semibold text-white mb-4">Your Classes</h2>

              {teacherClasses.length === 0 ? (
                <p className="text-slate-400">Không có lớp được phân công.</p>
              ) : (
                <ul className="space-y-3">
                  {teacherClasses.map((cls) => (
                    <li
                      key={cls.id}
                      className="panel p-3 flex justify-between items-center bg-white/5 rounded-lg border border-white/10"
                    >
                      <div>
                        <p className="font-medium text-white">{cls.name}</p>
                        <p className="text-xs text-slate-400">Subject ID: {cls.subjectId}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewStudents(cls.id)}
                          className="btn btn-ghost text-xs px-2 py-1 border border-white/20 hover:bg-white/10"
                        >
                          View Users
                        </button>

                        <button
                          onClick={() => handleCreateExam(cls.id)}
                          className="btn btn-primary text-xs px-2 py-1"
                        >
                          + Create Exam
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Danh sách sinh viên của lớp đang xem */}
            <div className="glass-card p-5">
              <h2 className="text-xl font-semibold text-white mb-4">
                {viewingClassId
                  ? `Students in Class #${viewingClassId}`
                  : 'Chọn một lớp để xem danh sách sinh viên'}
              </h2>

              {viewingClassId && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="py-2">ID/MSSV</th>
                        <th className="py-2">Name</th>
                        <th className="py-2">Email</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedClassStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b border-white/5 last:border-0 hover:bg-white/5"
                        >
                          <td className="py-2">{student.mssv || student.id}</td>
                          <td className="py-2">{student.fullName || 'N/A'}</td>
                          <td className="py-2">{student.email}</td>
                        </tr>
                      ))}

                      {selectedClassStudents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-slate-500">
                            Không có sinh viên.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Danh sách bài thi thuộc các lớp của giáo viên */}
            <div className="glass-card p-5 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-300">Exams</p>
                  <h2 className="text-xl font-semibold text-white">Bài thi trong các lớp của bạn</h2>
                </div>
              </div>

              {teacherExams.length === 0 ? (
                <p className="text-slate-400">Chưa có bài thi nào cho các lớp của bạn.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {teacherExams.map((ex) => (
                    <div
                      key={ex.id}
                      className="panel p-4 border border-white/10 rounded-xl bg-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{ex.name}</h3>
                        <span className="tag">
                          <span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden />
                          Class #{ex.classId}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300">
                        Thời lượng: {ex.durationMinutes} phút
                      </p>
                      <p className="text-xs text-slate-400">
                        Bắt đầu: {new Date(ex.startTime).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        Kết thúc: {new Date(ex.endTime).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // ============================
        // STUDENT DASHBOARD (GIAO DIỆN SINH VIÊN)
        // ============================
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-sky-200/70">Welcome back</p>
              <h1 className="text-3xl font-semibold text-white mt-1">Your exam cockpit</h1>
              <p className="text-sm text-slate-300 mt-2">
                Theo dõi thông báo, bài thi sắp tới và kết quả tại một nơi.
              </p>
            </div>

            {/* Thẻ thống kê nhanh số bài thi sắp tới */}
            <div className="glass-card px-4 py-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-200 font-semibold">
                {upcomingExams.length}
              </div>
              <div>
                <p className="text-xs text-slate-300">Upcoming exams</p>
                <p className="text-lg font-semibold text-white">
                  {upcomingExams.length > 0 ? 'Ready to go' : 'All clear'}
                </p>
              </div>
            </div>
          </div>

          {/* Banner thông báo (Student) */}
          <AnnouncementBanner announcements={announcements} />

          <section className="grid gap-6 lg:grid-cols-2">
            {/* Cột trái: bài thi sắp tới */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-300">Schedule</p>
                  <h2 className="text-xl font-semibold text-white">Upcoming Exams</h2>
                </div>
                <span className="tag">
                  <span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden />
                  Live
                </span>
              </div>

              {upcomingExams.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingExams.map((exam) => (
                    <li
                      key={exam.id}
                      className="panel p-4 flex items-start gap-3 hover:border-white/30"
                    >
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-sky-500/20 text-white font-semibold">
                        {exam.title.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{exam.title}</h3>
                        <p className="text-sm text-slate-300">
                          Bắt đầu: {exam.startTime.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-300">
                          Kết thúc: {exam.endTime.toLocaleString()}
                        </p>
                      </div>

                      {/* Link vào phòng thi theo route /exam/:examId */}
                      <Link to={`/exam/${exam.id}`} className="btn btn-primary text-sm">
                        Enter
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-300">Hiện không có bài thi sắp tới.</p>
              )}
            </div>

            {/* Cột phải: kết quả gần đây */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-300">Performance</p>
                  <h2 className="text-xl font-semibold text-white">Recent Results</h2>
                </div>
                <span className="tag">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                  Updated
                </span>
              </div>

              {/* Bảng kết quả (mock) */}
              <ResultTable results={results} />
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;

/**
 * Giải thích các khái niệm dễ vấp (người mới):
 *
 * 1) Vì sao có 2 useEffect?
 *    - useEffect #1: set dữ liệu theo role (mock cho student, clear cho teacher)
 *    - useEffect #2: chỉ chạy khi Teacher để gọi API thật lấy lớp/bài thi
 *    -> Tách ra để code rõ ràng, tránh if-else phức tạp một chỗ.
 *
 * 2) Vì sao Teacher lấy exams bằng cách “getAll rồi filter”?
 *    - Vì backend có endpoint get-all, FE lấy toàn bộ rồi lọc theo classId.
 *    - Tối ưu hơn là backend có endpoint: get-by-teacher (trả trực tiếp) nhưng hiện chưa có.
 *
 * 3) prompt có phải cách tốt không?
 *    - prompt nhanh, dễ demo nhưng UX kém.
 *    - Thực tế nên dùng modal/form component để nhập dữ liệu.
 *
 * 4) Set state kiểu setTeacherExams(prev => [...prev, newExam]) là gì?
 *    - Đây là “functional update”: đảm bảo dùng state mới nhất.
 *    - Tránh lỗi khi nhiều lần cập nhật state liên tiếp.
 */
