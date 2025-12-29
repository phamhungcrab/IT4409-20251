import apiClient, { ResultApiModel } from '../utils/apiClient';
import { UserRole } from './authService';

/**
 * UserDto:
 * - Dữ liệu “người dùng” mà backend trả về cho frontend.
 *
 * Giải thích các trường:
 * - id          : mã người dùng trong hệ thống
 * - mssv        : mã số sinh viên (nếu là sinh viên)
 * - fullName    : họ tên đầy đủ
 * - dateOfBirth : ngày sinh (dạng chuỗi, thường là ISO string)
 * - email       : email đăng nhập
 * - role        : vai trò người dùng (Admin/Teacher/Student)
 */

export interface UserDto {
  id: number;
  mssv: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  role: UserRole;
}

/**
 * SearchUserPayload:
 * - “Payload” nghĩa là dữ liệu gửi lên API (nội dung request body).
 * - Dùng cho chức năng tìm kiếm user.
 *
 * Các điều kiện tìm kiếm (optional):
 * - fullName: tìm theo tên
 * - mssv    : tìm theo MSSV
 * - email   : tìm theo email
 * - role    : lọc theo vai trò
 *
 * Phân trang (optional):
 * - pageSize   : mỗi trang bao nhiêu bản ghi (VD: 10, 20, 50)
 * - pageNumber : trang số mấy (thường bắt đầu từ 1)
 *
 * Lưu ý:
 * - Dấu ? nghĩa là có thể không truyền field đó.
 * - API sẽ hiểu “không truyền” là không lọc theo field đó.
 */
export interface SearchUserPayload {
  fullName?: string;
  mssv?: string;
  email?: string;
  role?: UserRole;
  pageSize?: number;
  pageNumber?: number;
}

/**
 * SearchUserResult:
 * - Kết quả trả về của API search.
 *
 * Giải thích:
 * - totalItems: tổng số user thỏa điều kiện (toàn hệ thống), để UI biết có bao nhiêu trang
 * - users     : danh sách user của trang hiện tại
 */

export interface SearchUserResult {
  totalItems: number;
  users: UserDto[];
}

/**
 * getAll():
 * - Lấy toàn bộ user (thường chỉ admin mới được phép).
 *
 * Endpoint:
 * - GET /api/User/get-all
 *
 * ResultApiModel<T> là gì?
 * - Thường backend sẽ “bọc” dữ liệu theo một khung chung, ví dụ:
 *   { success: true, message: "...", data: T }
 * - Khi đó ResultApiModel<UserDto[]> nghĩa là response trả về có “khung bọc”
 *   và dữ liệu thật nằm trong data.
 *
 * Ở đây bạn đang cast thẳng:
 *   return response as unknown as UserDto[];
 * => Có thể đúng nếu apiClient interceptor đã tự bóc response.data.data.
 * => Nếu chưa bóc, thì đoạn này sẽ sai (vì response vẫn là object bọc).
 */

const getAll = async (): Promise<UserDto[]> => {
  const response = await apiClient.get<ResultApiModel<UserDto[]>>('/api/User/get-all');
  return response as unknown as UserDto[];
};

/**
 * searchForUser(payload):
 * - Tìm user theo điều kiện (tên/MSSV/email/role) và có phân trang.
 * - Endpoint: POST /api/User/search-for-user
 *
 * Vì sao dùng POST để search?
 * - Vì gửi nhiều điều kiện lọc trong body sẽ gọn và dễ mở rộng hơn query string.
 *
 * Chú ý:
 * - Trả về SearchUserResult (totalItems + users).
 */
const searchForUser = async (payload: SearchUserPayload): Promise<SearchUserResult> => {
  const response = await apiClient.post<ResultApiModel<SearchUserResult>>(
    '/api/User/search-for-user',
    payload
  );
  return response as unknown as SearchUserResult;
};

/**
 * findByEmail(email):
 * - Hàm tiện ích: tìm nhanh user đầu tiên theo email.
 * - Dùng searchForUser với pageSize=1 để chỉ lấy 1 bản ghi đầu.
 *
 * Giải thích toán tử ??:
 * - a ?? b nghĩa là:
 *   + nếu a không phải null/undefined => lấy a
 *   + nếu a là null/undefined => lấy b
 *
 * result.users?.[0]:
 * - Dấu ?. nghĩa là “nếu users tồn tại thì lấy phần tử [0], nếu không thì trả undefined”
 * - Tránh lỗi runtime khi users là undefined/null.
 */
const findByEmail = async (email: string): Promise<UserDto | null> => {
  const result = await searchForUser({ email, pageNumber: 1, pageSize: 1 });
  return result.users?.[0] ?? null;
};

/**
 * userService:
 * - Export các hàm ra ngoài để component/page khác gọi.
 */
export const userService = {
  getAll,
  searchForUser,
  findByEmail,
};
