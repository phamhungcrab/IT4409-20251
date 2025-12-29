import apiClient from '../utils/apiClient';
import { UserRole } from './authService';

/**
 * UserDto:
 * - Dữ liệu “người dùng” mà backend trả về cho frontend.
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
 */
export interface SearchUserResult {
  totalItems: number;
  users: UserDto[];
}

/**
 * getAll():
 * - Lấy toàn bộ user (thường chỉ admin mới được phép).
 * - Endpoint: GET /api/User/get-all
 */
const getAll = async (): Promise<UserDto[]> => {
  return await apiClient.get<UserDto[]>('/api/User/get-all');
};

/**
 * searchForUser(payload):
 * - Tìm user theo điều kiện (tên/MSSV/email/role) và có phân trang.
 * - Endpoint: POST /api/User/search-for-user
 */
const searchForUser = async (payload: SearchUserPayload): Promise<SearchUserResult> => {
  return await apiClient.post<SearchUserResult>('/api/User/search-for-user', payload);
};

/**
 * findByEmail(email):
 * - Hàm tiện ích: tìm nhanh user đầu tiên theo email.
 * - Dùng searchForUser với pageSize=1 để chỉ lấy 1 bản ghi đầu.
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
