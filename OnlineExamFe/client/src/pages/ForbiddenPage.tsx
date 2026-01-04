import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ForbiddenPage (Trang 403 - Không có quyền truy cập)
 *
 * Ý nghĩa “403 Forbidden”:
 * - Đây là mã trạng thái (HTTP status code) thường dùng để báo:
 *   “Bạn đã đăng nhập (hoặc đã xác thực), nhưng KHÔNG có quyền truy cập tài nguyên này”.
 *
 * Phân biệt nhanh cho người mới:
 * - 401 Unauthorized: chưa đăng nhập / thiếu token => thường bị đẩy về /login
 * - 403 Forbidden: đã đăng nhập nhưng không đủ quyền (role không phù hợp) => đưa sang trang 403
 *
 * Trang này thường được dùng chung với hệ thống phân quyền (RoleGuard / Permission Guard).
 */
const ForbiddenPage: React.FC = () => {
  /**
   * useNavigate():
   * - Hook của react-router-dom để điều hướng (chuyển trang) bằng code.
   * - Ví dụ: navigate('/') sẽ chuyển về trang chủ.
   */
  const navigate = useNavigate();

  return (
    /**
     * Khung tổng:
     * - flex flex-col: dùng flexbox và sắp xếp theo cột
     * - items-center: căn giữa theo chiều ngang
     * - justify-center: căn giữa theo chiều dọc
     * - min-h-[60vh]: chiều cao tối thiểu = 60% chiều cao màn hình (để nội dung nằm giữa)
     * - text-center: chữ căn giữa
     * - p-6: padding (khoảng cách bên trong)
     */
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      {/* Tiêu đề lớn “403” để người dùng nhận biết đây là lỗi phân quyền */}
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-4">
        403
      </h1>

      {/* Tiêu đề mô tả lỗi */}
      <h2 className="text-3xl font-bold text-white mb-4">
        Truy cập bị từ chối
      </h2>

      {/* Nội dung giải thích cho người dùng hiểu vì sao không vào được */}
      <p className="text-slate-300 max-w-md mb-8 text-lg">
        Xin lỗi, bạn không có quyền truy cập vào trang này.
        Vui lòng kiểm tra lại tài khoản hoặc liên hệ quản trị viên.
      </p>

      {/**
       * Nút quay về trang chủ:
       * - onClick: sự kiện khi người dùng bấm nút
       * - navigate('/'): điều hướng về route "/"
       *
       * Lưu ý:
       * - Bạn có thể thay '/' bằng '/exams' hoặc '/results' tùy trang chính của hệ thống.
       */}
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-sky-500/30"
      >
        Quay về trang chủ
      </button>
    </div>
  );
};

export default ForbiddenPage;
