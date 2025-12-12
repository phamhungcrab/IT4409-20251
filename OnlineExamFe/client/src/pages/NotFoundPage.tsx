/**
 * NotFoundPage (Trang 404):
 *  - Trang hiển thị khi người dùng truy cập vào một đường dẫn (route)
 *    không tồn tại trong ứng dụng.
 *
 * Ví dụ:
 *  - Gõ nhầm URL: /examss
 *  - Click link cũ: /old-page
 *  -> React Router không tìm thấy route khớp nên sẽ hiện trang 404.
 *
 * Trong routes.tsx thường có route "bắt tất cả" (path: '*')
 * để render NotFoundPage khi không match được route nào.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    /**
     * Khung tổng:
     *  - min-h-[60vh]: chiều cao tối thiểu 60% màn hình để bố cục cân đối
     *  - flex + items-center + justify-center: căn giữa theo cả ngang và dọc
     *  - text-center: căn giữa nội dung chữ
     *  - space-y-4: khoảng cách dọc giữa các khối
     */
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      {/**
       * Card nội dung 404:
       *  - glass-card: class UI (thường tạo hiệu ứng kính mờ)
       *  - px-8 py-10: padding cho card
       *  - max-w-xl: giới hạn chiều rộng để đọc dễ hơn
       */}
      <div className="glass-card px-8 py-10 space-y-4 max-w-xl">
        {/* Dòng chữ “Lost in space” tạo cảm giác thân thiện, không quá “lỗi kỹ thuật” */}
        <p className="text-sm uppercase tracking-[0.35em] text-sky-200/80">
          Lost in space
        </p>

        {/* Hiển thị mã 404 thật lớn để người dùng hiểu đây là trang không tồn tại */}
        <h1 className="text-5xl font-bold text-white">404</h1>

        {/* Thông báo cho người dùng biết trang họ tìm không tồn tại */}
        <p className="text-lg text-slate-200">
          Oops! Trang bạn đang tìm không tồn tại.
        </p>
      </div>

      {/**
       * Link quay về trang chủ:
       *  - Dùng <Link> của react-router-dom để điều hướng trong SPA
       *  - Không reload lại trang như thẻ <a href="...">
       */}
      <Link to="/" className="btn btn-primary hover:-translate-y-0.5">
        Về trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;

/**
 * Giải thích các khái niệm dễ vấp:
 *
 * 1) 404 là gì?
 *    - 404 là mã HTTP “Not Found” (không tìm thấy tài nguyên).
 *    - Trong SPA, React Router mô phỏng điều này:
 *      nếu URL không khớp route nào thì ta hiển thị trang 404.
 *
 * 2) <Link> khác <a> thế nào?
 *    - <a href="/">: trình duyệt sẽ reload lại toàn bộ trang (chậm hơn, mất state SPA).
 *    - <Link to="/">: React Router điều hướng nội bộ (nhanh hơn, đúng kiểu SPA).
 *
 * 3) path="*" nghĩa là gì?
 *    - Trong routes.tsx, path: '*' nghĩa là “bắt mọi đường dẫn không khớp”.
 *    - Đây là cách phổ biến để show NotFoundPage.
 */
