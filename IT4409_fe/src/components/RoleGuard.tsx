import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * RoleGuardProps (Props của RoleGuard):
 * - children:
 *   + Là “phần giao diện con” bạn bọc bên trong RoleGuard.
 *   + Nếu người dùng đủ điều kiện truy cập thì RoleGuard sẽ render children này.
 *
 * - allowedRoles:
 *   + Danh sách role (vai trò) được phép truy cập trang.
 *   + Ví dụ: ['Admin'] nghĩa là chỉ Admin mới được vào.
 */
interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

/**
 * RoleGuard (Component canh cổng theo quyền):
 *
 * Mục tiêu:
 * - Bảo vệ route/page theo 2 lớp:
 *   (1) Có đăng nhập hay chưa? -> dựa vào token
 *   (2) Có đúng quyền hay không? -> dựa vào user.role
 *
 * Các khái niệm cần hiểu:
 * - token:
 *   + Thường là chuỗi (string) do backend cấp khi đăng nhập thành công (ví dụ JWT).
 *   + Frontend lưu token (localStorage/cookie/memory) để chứng minh “mình đã đăng nhập”.
 *
 * - role:
 *   + Vai trò người dùng (Admin/Teacher/Student...).
 *   + Dùng để phân quyền: ai được vào trang nào, ai được dùng chức năng nào.
 *
 * - redirect/điều hướng:
 *   + Khi user không đủ điều kiện, ta “đẩy” họ sang trang khác (vd: /login).
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
    /**
     * useAuth():
     * - Đây là custom hook (hook tự viết) để lấy thông tin đăng nhập hiện tại.
     * - Thường useAuth đọc dữ liệu từ AuthContext (React Context) hoặc từ store.
     * - Kết quả thường có:
     *   + user: thông tin người dùng (id, name, role, ...)
     *   + token: chuỗi token đăng nhập
     */
    const { user, token } = useAuth();

    /**
     * useLocation():
     * - Hook của react-router-dom để biết “hiện tại đang đứng ở đâu”.
     * - location chứa:
     *   + pathname: đường dẫn (vd: /admin/users)
     *   + search: query string (vd: ?page=1)
     *   + state: dữ liệu bạn có thể truyền kèm khi điều hướng
     *
     * Vì sao cần location?
     * - Khi bị đá về /login, ta có thể “ghi nhớ” trang đang muốn vào,
     *   để login xong quay lại đúng trang đó.
     */
    const location = useLocation();

    /**
     * BƯỚC 1: Chưa có token -> coi như chưa đăng nhập
     *
     * Lý do:
     * - Trong hầu hết hệ thống, token là bằng chứng user đã đăng nhập.
     * - Không có token => không thể gọi API cần xác thực => không cho vào trang bảo vệ.
     */
    if (!token) {
        /**
         * <Navigate />:
         * - Component của react-router-dom dùng để điều hướng.
         *
         * to="/login":
         * - Đẩy người dùng đến trang /login.
         *
         * state={{ from: location }}:
         * - Truyền kèm thông tin “trang ban đầu người dùng muốn vào”.
         * - Ví dụ user đang vào /admin, bị chặn -> đưa về /login kèm from=/admin.
         * - Sau khi login thành công, bạn có thể đọc state.from để quay lại /admin.
         *
         * replace:
         * - Thay thế lịch sử (history) hiện tại.
         * - Ý nghĩa dễ hiểu:
         *   + Nếu không dùng replace, user có thể bấm nút Back quay về trang bị chặn,
         *     gây cảm giác “nhấp nháy” hoặc vòng lặp điều hướng.
         *   + replace giúp lịch sử gọn hơn và tránh back quay về trang không hợp lệ.
         */
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    /**
     * BƯỚC 2: Có token rồi, nhưng kiểm tra quyền (role)
     *
     * Điều kiện:
     * - user tồn tại (đã load được thông tin user)
     * - và role của user KHÔNG nằm trong danh sách allowedRoles
     *
     * allowedRoles.includes(user.role):
     * - includes() kiểm tra xem một phần tử có nằm trong mảng hay không.
     * - Ví dụ allowedRoles = ['Admin', 'Teacher']
     *   user.role = 'Student' => includes() trả về false => không đủ quyền.
     */
    if (user && !allowedRoles.includes(user.role)) {
        /**
         * Nếu đã đăng nhập nhưng không đủ quyền:
         * - Có thể redirect về trang chủ "/"
         * - Hoặc bạn có thể tạo riêng trang "/403" (Forbidden) để báo “không có quyền”.
         */
        return <Navigate to="/403" replace />;
    }

    /**
     * BƯỚC 3: Cho phép truy cập
     *
     * Trường hợp hợp lệ:
     * - Có token và:
     *   + hoặc user đã có và role hợp lệ
     *   + hoặc user chưa kịp load (user = null/undefined) nhưng token đã có
     *     (tình huống này hay gặp khi bạn refresh trang, token có sẵn trong storage,
     *      nhưng app đang gọi API để lấy thông tin user)
     *
     * <>{children}</>:
     * - Fragment: nhóm nội dung mà không tạo thêm thẻ div thừa.
     * - Ý nghĩa: render đúng component trang mà bạn bọc bên trong RoleGuard.
     */
    return <>{children}</>;
};

export default RoleGuard;