import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnnouncements } from '../hooks/useAnnouncements';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { examService } from '../services/examService';

/**
 * AdminPage (Trang quản trị):
 *  - Đây là dashboard dành cho Admin.
 *  - Hiện tại trang làm 3 việc chính:
 *      1) Hiển thị thông báo (announcements) để “truyền thông” tới học sinh.
 *      2) Hiển thị bảng danh sách tất cả bài thi (lấy từ API getAllExams).
 *      3) Khu vực “Student management” hiện chỉ là placeholder (Coming soon).
 *
 * Lưu ý:
 *  - Nút Create/Edit/Delete hiện chỉ là UI (chưa nối endpoint backend).
 *  - Kiểu dữ liệu exam đang dùng any[] nên dễ sai field (title/duration...) nếu backend khác.
 *    Tốt nhất nên tạo interface ExamDto chuẩn.
 */
const AdminPage: React.FC = () => {
  /**
   * i18next:
   *  - t(key): lấy text theo đa ngôn ngữ.
   */
  const { t } = useTranslation();

  /**
   * useAnnouncements:
   *  - Hook lấy danh sách thông báo.
   *  - Trả về:
   *      + announcements: danh sách thông báo
   *      + loading      : trạng thái đang tải
   *
   * Ở các trang khác (Layout/HomePage), hook này có thể nhận user để lọc theo role.
   * Ở AdminPage, gọi không truyền gì nghĩa là lấy chung.
   */
  const { announcements, loading: announcementsLoading } = useAnnouncements();

  /**
   * exams:
   *  - Danh sách tất cả bài thi (Admin xem toàn hệ thống).
   *  - Hiện dùng any[] để nhanh, nhưng nên typing lại để chắc chắn.
   */
  const [exams, setExams] = useState<any[]>([]);

  /**
   * loadingExams:
   *  - Trạng thái đang tải danh sách exams.
   */
  const [loadingExams, setLoadingExams] = useState(true);

  /**
   * useEffect: tải danh sách bài thi khi trang AdminPage được mount (vào trang lần đầu).
   *  - dependency [] => chỉ chạy 1 lần.
   */
  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Gọi API lấy toàn bộ bài thi
        const data = await examService.getAllExams();
        setExams(data);
      } catch (error) {
        console.error('Không thể tải danh sách bài thi', error);
      } finally {
        // Dù lỗi hay thành công vẫn tắt loading
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header trang */}
      <div>
        <p className="text-sm text-slate-300">{t('admin.dashboard')}</p>
        <h1 className="text-3xl font-semibold text-white">Control & monitor exams</h1>
      </div>

      {/* =========================
          KHU THÔNG BÁO (ANNOUNCEMENTS)
          ========================= */}
      <section className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-300">{t('admin.announcements')}</p>
            <h2 className="text-xl font-semibold text-white">Gửi thông báo tới học sinh</h2>
          </div>
          <span className="tag">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            Live
          </span>
        </div>

        {/* Nếu đang loading announcements thì hiện loading, ngược lại render AnnouncementBanner */}
        {announcementsLoading ? (
          <div>{t('common.loading')}</div>
        ) : (
          <AnnouncementBanner announcements={announcements} />
        )}
      </section>

      {/* =========================
          KHU QUẢN LÝ BÀI THI (EXAM MANAGEMENT)
          ========================= */}
      <section className="glass-card p-5">
        <div className="flex justify-between items-center mb-4 gap-3">
          <div>
            <p className="text-sm text-slate-300">{t('admin.allExams')}</p>
            <h2 className="text-xl font-semibold text-white">Quản lý bài thi</h2>
          </div>

          {/* Nút tạo bài thi: hiện chưa gắn logic */}
          <button className="btn btn-primary hover:-translate-y-0.5">
            {t('admin.createExam')}
          </button>
        </div>

        {/* Loading danh sách bài thi */}
        {loadingExams ? (
          <div>{t('common.loading')}</div>
        ) : (
          /**
           * Bảng danh sách bài thi:
           *  - overflow-hidden + rounded + border: tạo khung bảng đẹp
           */
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">
                    {t('exam.startTime')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">
                    {t('exam.duration')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {/**
                 * Lặp qua danh sách exams và render từng dòng.
                 *
                 * Lưu ý dễ sai:
                 *  - Bạn đang dùng exam.title và exam.duration
                 *  - Nhưng ở các file khác, exam có thể là ex.name và ex.durationMinutes.
                 *  -> Vì bạn dùng any[] nên TypeScript không báo lỗi.
                 *  -> Nên chuẩn hóa field hoặc tạo interface ExamDto.
                 */}
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {exam.id}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      {exam.title}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {new Date(exam.startTime).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {exam.duration} mins
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {/* Nút Edit/Delete hiện chưa gắn API */}
                      <button className="tag hover:border-white/30 hover:text-white">
                        {t('common.edit')}
                      </button>
                      <button className="tag hover:border-rose-300/50 hover:text-rose-100 border-rose-300/30 text-rose-100">
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =========================
          KHU QUẢN LÝ SINH VIÊN (COMING SOON)
          ========================= */}
      <section className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-300">{t('admin.students')}</p>
            <h2 className="text-xl font-semibold text-white">Quản lý sinh viên</h2>
          </div>

          <span className="tag">
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
            Coming soon
          </span>
        </div>

        <div className="panel p-4 text-center text-slate-300">
          Giao diện quản lý sinh viên sẽ được bổ sung sau...
        </div>
      </section>
    </div>
  );
};

export default AdminPage;

/**
 * Giải thích các khái niệm dễ vấp (người mới):
 *
 * 1) useEffect với [] nghĩa là gì?
 *    - [] nghĩa là effect chỉ chạy đúng 1 lần khi component mount.
 *    - Phù hợp để gọi API tải dữ liệu ban đầu.
 *
 * 2) Vì sao nên bỏ any[]?
 *    - any làm TypeScript mất tác dụng kiểm tra lỗi.
 *    - Ví dụ: exam.title vs exam.name, exam.duration vs exam.durationMinutes
 *      TypeScript sẽ không báo gì => rất dễ bug.
 *
 * 3) AnnouncementBanner hoạt động thế nào?
 *    - Nó nhận announcements[] và render các banner.
 *    - Người dùng có thể đóng (dismiss) banner và nó sẽ ẩn trong state nội bộ.
 *
 * 4) Nút Create/Edit/Delete hiện làm gì?
 *    - Chỉ là UI. Muốn hoạt động phải có endpoint backend tương ứng:
 *      - POST /api/Exam/create-exam
 *      - PUT/PATCH /api/Exam/update
 *      - DELETE /api/Exam/delete
 *    Sau đó gọi qua examService và cập nhật state exams.
 */
