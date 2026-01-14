import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resultService, ResultItem } from '../services/resultService';
import useAuth from '../hooks/useAuth';
import ResultTable from '../components/ResultTable';

/**
 * ResultsPage:
 *  - Trang hiển thị kết quả thi (điểm) của người dùng.
 *  - Thông thường chỉ Student xem được trang này (đã được RoleGuard bảo vệ ở routes).
 *
 * Luồng hoạt động chính:
 *  1) Lấy thông tin user hiện tại từ useAuth().
 *  2) Khi user đã sẵn sàng (không null), gọi API lấy danh sách kết quả theo user.id.
 *  3) Trong lúc chờ API, hiển thị trạng thái loading.
 *  4) Khi có dữ liệu, truyền xuống component ResultTable để render bảng.
 */
const ResultsPage: React.FC = () => {
  /**
   * useTranslation:
   *  - t(key): lấy text theo đa ngôn ngữ (i18next).
   *  - Ở đây dùng t('common.loading'), t('nav.results')...
   */
  const { t } = useTranslation();

  /**
   * useAuth:
   *  - user: thông tin người dùng hiện tại (id/email/role).
   *  - Nếu user = null nghĩa là chưa đăng nhập hoặc vừa logout.
   */
  const { user } = useAuth();

  /**
   * results:
   *  - State lưu danh sách kết quả thi.
   *  - Khởi tạo rỗng [] vì ban đầu chưa gọi API.
   */
  const [results, setResults] = useState<ResultItem[]>([]);

  /**
   * loading:
   *  - State biểu thị trạng thái đang tải dữ liệu.
   *  - Ban đầu = true vì trang vừa vào sẽ gọi API.
   */
  const [loading, setLoading] = useState(true);

  /**
   * useEffect:
   *  - Hook chạy sau khi component render.
   *  - Dependency [user] nghĩa là:
   *      + Khi user thay đổi (từ null -> có user, hoặc đổi user), effect sẽ chạy lại.
   *
   * Mục tiêu:
   *  - Khi đã có user, gọi API lấy kết quả theo user.id.
   */
  useEffect(() => {
    /**
     * fetchResults:
     *  - Hàm bất đồng bộ (async) để gọi API.
     *  - Việc bọc trong function giúp ta dùng await bên trong.
     */
    const fetchResults = async () => {
      // Nếu chưa có user thì không gọi API (tránh lỗi user.id undefined)
      if (!user) return;

      try {
        /**
         * Gọi service:
         *  - resultService.getResultsByStudent(user.id)
         *  - Service này sẽ dùng apiClient gọi backend.
         *
         * Kết quả trả về là mảng ResultItem[] (đã được typing).
         */
        const data = await resultService.getResultsByStudent(user.id);

        // Lưu kết quả vào state để UI render lại
        setResults(data);
      } catch (error) {
        /**
         * Nếu API lỗi:
         *  - Hiện tại chỉ log ra console.
         *  - Thực tế có thể show toast/message cho người dùng.
         */
        console.error('Không thể tải kết quả thi', error);
      } finally {
        /**
         * finally luôn chạy dù thành công hay thất bại.
         *  - Dùng để tắt loading.
         */
        setLoading(false);
      }
    };

    // Gọi hàm fetchResults ngay khi effect chạy
    fetchResults();
  }, [user]);

  /**
   * Nếu đang loading:
   *  - Render một dòng text “Loading...” (đa ngôn ngữ).
   *  - Đây là cách đơn giản nhất.
   *  - Nếu muốn UI đẹp hơn, có thể thay bằng spinner/skeleton.
   */
  if (loading) return <div>{t('common.loading')}</div>;

  return (
    /**
     * Layout trang:
     *  - max-w-5xl mx-auto: giới hạn chiều rộng và căn giữa trang
     *  - p-6: padding
     *  - space-y-4: khoảng cách dọc giữa các khối
     */
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Tiêu đề trang */}
      <div>
        <p className="text-sm text-slate-300">{t('nav.results')}</p>
        <h1 className="text-3xl font-semibold text-white">Scoreboard</h1>
      </div>

      {/* Bảng kết quả: component con chịu trách nhiệm render chi tiết */}
      <ResultTable results={results} />
    </div>
  );
};

export default ResultsPage;

/**
 * Giải thích các khái niệm dễ vấp (người mới):
 *
 * 1) useEffect là gì?
 *    - Là hook chạy “sau khi render”.
 *    - Dùng để làm các việc “side effects” như gọi API, set event listener,...
 *    - [user] là dependency: user đổi thì effect chạy lại.
 *
 * 2) Tại sao phải check `if (!user) return;`?
 *    - Vì lúc mới vào trang, user có thể đang null (chưa kịp load từ localStorage/context).
 *    - Nếu gọi API ngay và dùng user.id sẽ lỗi.
 *
 * 3) Tại sao có try/catch/finally?
 *    - try: chạy phần gọi API.
 *    - catch: bắt lỗi nếu API fail.
 *    - finally: luôn chạy để tắt loading (tránh bị loading vô hạn).
 *
 * 4) Vì sao tách resultService?
 *    - Component UI (ResultsPage) chỉ lo hiển thị và gọi service.
 *    - Service lo gọi API cụ thể (URL, headers, typing...).
 *    - Code rõ ràng, dễ bảo trì, test tốt hơn. 
 */
