/**
 * Component gốc (root) của ứng dụng React.
 *
 * App có nhiệm vụ:
 *  - Lấy cấu hình route (đường dẫn → component) từ `routes.tsx`.
 *  - Dùng hook `useRoutes` để biến cấu hình đó thành các React element.
 *  - Bọc toàn bộ kết quả trong `<Suspense>` để hỗ trợ lazy loading:
 *      + Khi một trang (component) đang được tải bất đồng bộ,
 *        Suspense sẽ hiển thị giao diện "Loading..." tạm thời.
 */

import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { appRoutes } from './routes';

// Khai báo component App kiểu React.FC (Functional Component)
const App: React.FC = () => {
  /**
   * useRoutes:
   *  - Là hook của react-router-dom.
   *  - Nhận vào một mảng cấu hình route (appRoutes).
   *  - Trả về các React element tương ứng với URL hiện tại.
   *
   * Nói dễ hiểu:
   *  - appRoutes = "bản đồ" định nghĩa: path nào → component nào.
   *  - useRoutes(appRoutes) = "dựa vào URL hiện tại, tạo ra cây component tương ứng".
   *
   * Ví dụ:
   *  - Nếu URL là /login -> useRoutes trả về element <LoginPage />.
   *  - Nếu URL là /exams -> trả về <ExamListPage />.
   */
  const element = useRoutes(appRoutes);

  return (
    /**
     * <Suspense>:
     *  - Là component của React để hỗ trợ "lazy loading" (tải component chậm, bất đồng bộ).
     *  - Prop `fallback` là thứ sẽ hiển thị tạm thời trong lúc một component con
     *    đang được load (ví dụ: khi dùng React.lazy để import trang).
     *
     * Trong app này:
     *  - Khi người dùng mở một trang mà component của trang đó đang được tải,
     *  - React sẽ tạm thời hiển thị khối giao diện "Loading experience..." bên dưới.
     */
    <Suspense
      fallback={
        // Đây là giao diện loading, hiển thị khi component con chưa load xong.
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <div className="flex items-center gap-3">
            {/* Chấm tròn nhỏ có animation "ping" để tạo cảm giác đang xử lý */}
            <span className="h-3 w-3 animate-ping rounded-full bg-sky-400" />
            {/* Dòng chữ thông báo đang loading trải nghiệm */}
            <span className="text-lg font-semibold tracking-wide">
              Loading - Please wait...
            </span>
          </div>
        </div>
      }
    >
      {/* `element` là cây component do useRoutes sinh ra, tương ứng với route hiện tại */}
      {element}
    </Suspense>
  );
};

export default App;
