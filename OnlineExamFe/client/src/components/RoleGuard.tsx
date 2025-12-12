import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * RoleGuardProps:
 *  - children    : phần giao diện (component) sẽ được hiển thị nếu user đủ quyền.
 *  - allowedRoles: danh sách các role được phép truy cập route này.
 *
 * Ví dụ:
 *  <RoleGuard allowedRoles={['Admin']}>
 *    <AdminPage />
 *  </RoleGuard>
 *  -> Chỉ user có role = 'Admin' mới thấy được AdminPage.
 */
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * RoleGuard:
 *  - Component dùng để "canh cổng" cho các route cần phân quyền.
 *  - Dùng useAuth() để lấy thông tin user + token hiện tại.
 *  - Dùng useLocation() để biết đang ở URL nào (để redirect đúng).
 *
 * Luồng xử lý:
 *  1. Nếu không có token  -> coi như chưa đăng nhập  -> redirect về /login.
 *  2. Nếu có user nhưng role không nằm trong allowedRoles -> redirect về '/'.
 *  3. Nếu vượt qua được 2 điều kiện trên -> render children (tức là cho vào trang).
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  // Lấy user và token từ context auth (useAuth)
  const { user, token } = useAuth();

  // useLocation: hook của react-router-dom, cho biết thông tin route hiện tại (pathname, search, state,...)
  const location = useLocation();

  // Trường hợp chưa có token: coi như chưa đăng nhập
  if (!token) {
    // Chưa login -> điều hướng tới trang /login
    //  - state={{ from: location }}: truyền kèm thông tin route hiện tại,
    //    để sau khi login xong có thể quay lại (nếu muốn).
    //  - replace: true -> thay thế lịch sử hiện tại, tránh user bấm back quay về trang bị chặn.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Có token, nhưng nếu user tồn tại mà role không thuộc danh sách được phép
  if (user && !allowedRoles.includes(user.role)) {
    // Đã đăng nhập nhưng không đủ quyền truy cập route này
    // Có thể redirect về trang chủ '/' hoặc một trang "Không có quyền truy cập"
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập và có quyền (hoặc user chưa kịp load nhưng có token)
  // -> Cho phép render children (trang đích)
  return <>{children}</>;
};

export default RoleGuard;
