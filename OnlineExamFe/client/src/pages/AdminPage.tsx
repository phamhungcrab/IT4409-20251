import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnnouncements } from '../hooks/useAnnouncements';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { examService } from '../services/examService';
import { ExamDto } from '../types/exam';

/**
 * AdminPage (Trang quản trị):
 *
 * Đây là dashboard dành cho Admin. Hiện tại trang làm 3 việc chính:
 * 1) Hiển thị thông báo (announcements) để truyền thông tới học sinh.
 * 2) Hiển thị bảng danh sách tất cả bài thi (lấy từ API getAllExams).
 * 3) Khu vực “Quản lý sinh viên” hiện chỉ là placeholder (chưa làm).
 *
 * Lưu ý:
 * - Nút Tạo/Sửa/Xoá hiện chỉ là UI minh hoạ (chưa nối API backend).
 */
const AdminPage: React.FC = () => {
  /**
   * i18next:
   * - t('key') để lấy text đa ngôn ngữ.
   */
  const { t } = useTranslation();

  /**
   * useAnnouncements:
   * - Hook (tự viết) để lấy danh sách thông báo.
   *
   * Trả về:
   * - announcements: mảng thông báo
   * - loading: đang tải hay không
   *
   * Ghi chú:
   * - Ở một số nơi, hook có thể nhận user để lọc theo role.
   * - Ở AdminPage, gọi không truyền gì nghĩa là lấy danh sách chung.
   */
  const { announcements, loading: announcementsLoading } = useAnnouncements();

  /**
   * exams:
   * - Danh sách tất cả bài thi của hệ thống (Admin có quyền xem toàn bộ).
   */
  const [exams, setExams] = useState<ExamDto[]>([]);

  /**
   * loadingExams:
   * - Trạng thái đang tải danh sách bài thi.
   */
  const [loadingExams, setLoadingExams] = useState(true);

  /**
   * useEffect (tải dữ liệu ban đầu):
   *
   * - useEffect chạy khi component “mount” (vào trang lần đầu).
   * - dependency [] nghĩa là: chỉ chạy đúng 1 lần.
   *
   * Tại sao hay dùng [] để gọi API?
   * - Vì bạn muốn tải dữ liệu ngay khi trang được mở.
   * - Nếu không có dependency [], effect sẽ chạy lại nhiều lần gây gọi API liên tục.
   */
  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Gọi API lấy toàn bộ bài thi
        const data = await examService.getAllExams();

        // Cập nhật state => React render lại bảng
        setExams(data);
      } catch (error) {
        console.error('Không thể tải danh sách bài thi', error);
      } finally {
        // Dù lỗi hay thành công vẫn tắt loading để UI không bị “kẹt”
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* PHẦN 1: Header trang */}
      <div>
        <p className="text-sm text-slate-300">{t('admin.dashboard')}</p>
        <h1 className="text-3xl font-semibold text-white">Điều khiển và giám sát bài thi</h1>
      </div>

      {/* =========================
          PHẦN 2: KHU THÔNG BÁO (ANNOUNCEMENTS)
          ========================= */}
      <section className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-300">{t('admin.announcements')}</p>
            <h2 className="text-xl font-semibold text-white">Gửi thông báo tới học sinh</h2>
          </div>

          {/* Tag “Đang hoạt động” chỉ là UI trang trí */}
          <span className="tag">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            Đang hoạt động
          </span>
        </div>

        {/* Nếu đang tải thông báo => hiện loading; tải xong => render AnnouncementBanner */}
        {announcementsLoading ? (
          <div>{t('common.loading')}</div>
        ) : (
          <AnnouncementBanner announcements={announcements} />
        )}
      </section>

      {/* =========================
          PHẦN 3: KHU QUẢN LÝ BÀI THI (EXAM MANAGEMENT)
          ========================= */}
      <section className="glass-card p-5">
        <div className="flex justify-between items-center mb-4 gap-3">
          <div>
            <p className="text-sm text-slate-300">{t('admin.allExams')}</p>
            <h2 className="text-xl font-semibold text-white">Quản lý bài thi</h2>
          </div>

          {/* Nút tạo bài thi:
              - disabled vì hiện tại chưa có API endpoint cho Admin
              - (Trong dự án của bạn, có thể Teacher mới là người tạo đề) */}
          <button
            className="btn btn-primary opacity-50 cursor-not-allowed"
            disabled
            title="Chức năng sẽ được bổ sung sau (chưa có API cho Admin)"
          >
            {t('admin.createExam')} (Sắp có)
          </button>
        </div>

        {/* Loading danh sách bài thi */}
        {loadingExams ? (
          <div>{t('common.loading')}</div>
        ) : (
          /**
           * Bảng danh sách bài thi:
           * - overflow-hidden + rounded + border: tạo khung bảng đẹp
           *
           * Lưu ý cho người mới:
           * - <table> là bảng HTML truyền thống
           * - <thead> là phần tiêu đề
           * - <tbody> là phần dữ liệu
           * - map(exams) để render mỗi exam thành 1 hàng <tr>
           */
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">
                    Tên bài thi
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

              {/* divide-y: tạo đường kẻ mờ giữa các hàng */}
              <tbody className="divide-y divide-white/5">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {exam.id}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      {exam.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {new Date(exam.startTime).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {exam.durationMinutes} phút
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {/* Nút Sửa/Xoá:
                          - hiện tại chỉ là UI => disabled
                          - sau này muốn chạy thật phải có API update/delete */}
                      <button
                        className="tag text-slate-500 border-slate-700 cursor-not-allowed"
                        disabled
                        title="Chức năng sửa sẽ được bổ sung sau"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        className="tag text-slate-500 border-slate-700 cursor-not-allowed"
                        disabled
                        title="Chức năng xoá sẽ được bổ sung sau"
                      >
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
          PHẦN 4: KHU QUẢN LÝ SINH VIÊN (CHƯA LÀM)
          ========================= */}
      <section className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-300">{t('admin.students')}</p>
            <h2 className="text-xl font-semibold text-white">Quản lý sinh viên</h2>
          </div>

          {/* Tag “Sắp có” chỉ là UI */}
          <span className="tag">
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
            Sắp có
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
 * - [] nghĩa là effect chỉ chạy đúng 1 lần khi component được render lần đầu.
 * - Thường dùng để gọi API lấy dữ liệu ban đầu (initial data).
 *
 * 2) Hook (custom hook) là gì?
 * - Hook là hàm bắt đầu bằng chữ “use...” (useState, useEffect, useAuth, useAnnouncements...).
 * - Custom hook là hook do bạn tự viết để gom logic lại cho gọn, dễ tái sử dụng.
 *
 * 3) Vì sao dùng state loading?
 * - Vì gọi API có thời gian chờ.
 * - Nếu không có loading, người dùng sẽ thấy màn hình trống và không biết đang xảy ra gì.
 *
 * 4) Vì sao nút Tạo/Sửa/Xoá đang disabled?
 * - Vì hiện tại chưa có API backend tương ứng.
 * - Khi muốn làm thật, bạn cần:
 *   + API tạo bài thi: POST ...
 *   + API sửa bài thi: PUT/PATCH ...
 *   + API xoá bài thi: DELETE ...
 *   Sau đó gọi qua examService và cập nhật lại state exams để bảng refresh.
 */
