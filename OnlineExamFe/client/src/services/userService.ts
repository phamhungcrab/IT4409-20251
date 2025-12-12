import apiClient, { ResultApiModel } from '../utils/apiClient';
import { UserRole } from './authService';

/**
 * UserDto:
 *  - Đây là kiểu dữ liệu đại diện cho một user lấy từ backend.
 *  - "Dto" = Data Transfer Object (dùng để trao đổi dữ liệu giữa FE và BE).
 *
 * Các trường:
 *  - id         : id của user trong hệ thống
 *  - mssv       : mã số sinh viên
 *  - fullName   : họ tên đầy đủ
 *  - dateOfBirth: ngày sinh (chuỗi, thường ở dạng ISO, ví dụ '2002-01-01')
 *  - email      : email đăng nhập
 *  - role       : vai trò (UserRole: Admin/Teacher/Student)
 */
export interface UserDto {
  id: number;
  mssv: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  role: UserRole; // Giả định backend trả role dạng số hoặc chuỗi tương ứng enum UserRole
}

/**
 * userService:
 *  - Tập hợp các hàm gọi API liên quan đến user.
 *  - Ở đây mới chỉ có hàm getAll() lấy danh sách tất cả user.
 */
export const userService = {
  /**
   * Lấy danh sách tất cả user từ backend.
   *
   * Luồng:
   *  - Gọi GET /api/User/get-all qua apiClient.
   *  - apiClient đã có interceptor response:
   *      + Nếu backend trả theo mẫu ResultApiModel và isStatus/status = true
   *        -> interceptor sẽ "unwrap" và trả về thẳng result.data.
   *      + Nếu không, trả về response.data nguyên xi.
   *
   * Chú ý:
   *  - Ở đây ta khai báo kiểu generic ResultApiModel<UserDto[]> cho apiClient.get,
   *    nhưng thực tế interceptor đã unwrap nên thứ nhận được là UserDto[].
   *  - Vì TypeScript vẫn nghĩ đó là ResultApiModel<UserDto[]> nên ta cần ép kiểu
   *    về UserDto[] bằng as unknown as UserDto[].
   */
  getAll: async (): Promise<UserDto[]> => {
    // Gọi API lấy tất cả user.
    // Lưu ý: do interceptor, response thực tế sẽ là mảng UserDto[] nếu API trả đúng mẫu.
    const response = await apiClient.get<ResultApiModel<UserDto[]>>('/api/User/get-all');

    // Ép kiểu sang UserDto[] để dùng cho đúng với phần còn lại của code.
    return response as unknown as UserDto[];
  },
};
