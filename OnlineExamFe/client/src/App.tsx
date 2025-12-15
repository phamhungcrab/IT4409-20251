/**
 * App.tsx - Component gốc (root) của ứng dụng React.
 *
 * App chịu trách nhiệm:
 *  - Nhận "bản đồ điều hướng" (routes) từ routes.tsx
 *  - Dùng useRoutes() để tạo ra cây component tương ứng với URL hiện tại
 *  - Bọc bằng <Suspense> để hỗ trợ lazy-loading (tải trang theo nhu cầu)
 *
 * Ghi chú cho người mới:
 *  - "Route" = đường dẫn URL (ví dụ /login, /exams)
 *  - "Lazy-loading" = chỉ tải code của trang khi người dùng thật sự truy cập trang đó
 *  - "Suspense fallback" = giao diện tạm hiển thị trong lúc trang đang được tải
 */

import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { appRoutes } from './routes';

const App: React.FC = () => {
  /**
   * useRoutes(appRoutes):
   *  - appRoutes là mảng cấu hình route (path -> component)
   *  - useRoutes sẽ nhìn URL hiện tại và trả về "element" tương ứng
   *
   * Ví dụ:
   *  - URL = /login  => element sẽ là <LoginPage /> (được định nghĩa trong routes.tsx)
   *  - URL = /exams  => element sẽ là <ExamListPage />
   */
  const element = useRoutes(appRoutes);

  return (
    /**
     * <Suspense fallback={...}>:
     *  - Khi bạn dùng React.lazy() để import các trang, React sẽ tải các trang đó bất đồng bộ.
     *  - Trong lúc đang tải, React sẽ hiển thị UI trong fallback.
     *
     * Vì sao cần fallback:
     *  - Nếu không có fallback, người dùng sẽ thấy màn hình trống/giật.
     *  - fallback giúp UX mượt: cho biết app đang tải và chưa "đơ".
     */
    <Suspense
      fallback={
        // UI loading: mục tiêu là hiển thị đẹp, rõ ràng và nhẹ nhàng
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
          {/* Hiệu ứng nền phát sáng để màn hình loading bớt đơn điệu */}
          <div className="absolute top-1/4 -left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

          {/* Khung dạng "glass" (mờ nền) để chứa spinner + chữ */}
          <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800/50 shadow-2xl ring-1 ring-white/10">
            {/* Spinner: kết hợp nhiều lớp để tạo cảm giác hiện đại */}
            <div className="relative w-16 h-16 mb-6">
              {/* Vòng ngoài nhấp nháy nhẹ */}
              <div className="absolute inset-0 rounded-full border border-sky-500/30 animate-[ping_3s_ease-in-out_infinite]" />
              {/* Vòng xoay (spinner) tạo cảm giác đang xử lý */}
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-sky-400 border-r-indigo-400 animate-spin" />
              {/* Tâm phát sáng */}
              <div className="absolute inset-6 rounded-full bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] animate-pulse" />
            </div>

            {/* Nội dung chữ: thông báo đang tải */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
                Đang tải ứng dụng
              </h3>
              <p className="text-sm text-slate-400/80 font-medium tracking-wide">
                Đang chuẩn bị trải nghiệm...
              </p>
            </div>
          </div>
        </div>
      }
    >
      {/* element là cây component do useRoutes sinh ra, tùy theo URL hiện tại */}
      {element}
    </Suspense>
  );
};

export default App;
