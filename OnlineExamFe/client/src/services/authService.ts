/**
 * authService:
 *
 * Cung cấp các hàm làm việc với API xác thực (authentication) của backend:
 *  - login  : đăng nhập
 *  - logout : đăng xuất
 *  - refreshToken : xin token mới khi token cũ sắp/đã hết hạn
 *  - sendOtp / checkOtp : gửi và kiểm tra mã OTP
 *
 * Tất cả các request đều dùng chung apiClient (axios đã cấu hình sẵn),
 * giúp:
 *  - Dùng cùng baseURL (VITE_API_BASE_URL)
 *  - Tự động gắn header (ví dụ Authorization)
 *  - Xử lý lỗi / unwrap response chung trong interceptor
 */

import apiClient from '../utils/apiClient';

/**
 * UserRole:
 *  - Dùng enum để quản lý các loại vai trò người dùng trong hệ thống:
 *      + Admin   : quản trị viên
 *      + Teacher : giảng viên
 *      + Student : sinh viên
 *
 * enum giúp code dễ đọc hơn, tránh gõ sai string ('Admin', 'admin', 'Admim',...)
 */
export enum UserRole {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Student = 'Student'
}

/**
 * LoginDto:
 *  - "DTO" = Data Transfer Object = kiểu dữ liệu gửi lên backend.
 *  - Đây là payload của request login.
 *
 * Các field chính:
 *  - email     : email người dùng
 *  - password  : mật khẩu
 *  - ipAdress  : (tùy chọn) IP của client (nếu FE thu thập được)
 *  - userAgent : (tùy chọn) thông tin trình duyệt / thiết bị
 *  - deviceId  : (tùy chọn) id thiết bị (nếu có logic multi-device)
 *
 * Lưu ý: ipAdress ở đây bị viết sai chính tả (thiếu 'd' trong Address),
 * cần đồng bộ với backend, nhưng về cơ bản chỉ là tên field.
 */
export interface LoginDto {
  email: string;
  password: string;
  ipAdress?: string;
  userAgent?: string;
  deviceId?: string;
}

/**
 * RegisterDto:
 *  - Payload dùng khi đăng ký tài khoản mới (nếu FE có form register).
 *
 * Các trường:
 *  - email       : email đăng nhập
 *  - password    : mật khẩu
 *  - mssv        : mã số sinh viên
 *  - role        : vai trò (Student / Teacher / Admin) dùng enum UserRole
 *  - fullName    : họ tên đầy đủ
 *  - dateOfBirth : ngày sinh, dạng string theo chuẩn ISO (vd: '2002-01-01')
 *  - ipAdress    : IP client (optional)
 *  - userAgent   : thông tin trình duyệt (optional)
 *  - deviceId    : id thiết bị (optional)
 */
export interface RegisterDto {
  email: string;
  password: string;
  mssv: string;
  role: UserRole;
  fullName: string;
  dateOfBirth: string; // Chuỗi ngày dạng ISO, ví dụ '2025-12-07'
  ipAdress?: string;
  userAgent?: string;
  deviceId?: string;
}

/**
 * LogoutDto:
 *  - Payload gửi lên khi người dùng logout.
 *  - Backend có thể dùng deviceId, ipAddress, userAgent để xóa session/token đúng thiết bị.
 *
 *  - userId    : id của user trong hệ thống
 *  - deviceId  : id thiết bị (optional)
 *  - ipAddress : IP client (optional)
 *  - userAgent : trình duyệt (optional)
 */
export interface LogoutDto {
  userId: number;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * SendOtpDto:
 *  - Payload gửi khi user yêu cầu gửi OTP (ví dụ: quên mật khẩu, xác thực email,...)
 *  - email: email nhận OTP.
 */
export interface SendOtpDto {
  email: string;
}

/**
 * CheckOtpDto:
 *  - Payload gửi khi user nhập OTP và muốn backend kiểm tra.
 *  - otp   : mã OTP user nhập
 *  - email : email tương ứng với OTP
 */
export interface CheckOtpDto {
  otp: string;
  email: string;
}

/**
 * TokenResponse:
 *  - Kiểu dữ liệu backend trả về sau khi login/refresh token.
 *  - Có 2 khả năng:
 *      1. string: backend trả về một chuỗi token duy nhất.
 *      2. object: backend trả về { accessToken, refreshToken }.
 *
 *  - Việc dùng `string | { ... }` là "union type" của TypeScript:
 *      + Response có thể là kiểu này HOẶC kiểu kia.
 */
export type TokenResponse = string | {
  accessToken: string;
  refreshToken: string;
};

/**
 * RefreshTokenDto:
 *  - Payload gửi lên để xin token mới khi token cũ hết hạn.
 *
 *  - accessToken : token hiện tại (có thể đã hoặc sắp hết hạn)
 *  - refreshToken: token dùng để xin token mới (thường sống lâu hơn)
 *  - deviceId    : id thiết bị
 *  - ipAddress   : IP client
 *  - userAgent   : trình duyệt
 */
export interface RefreshTokenDto {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * authService:
 *  - Tập hợp các hàm wrap việc gọi API Auth.
 *  - Mỗi hàm tương ứng với một endpoint backend.
 */
export const authService = {
  /**
   * Gọi API đăng nhập.
   *  - data: LoginDto (email, password, ...).
   *  - Trả về Promise<TokenResponse> tức là 1 Promise
   *    resolve ra TokenResponse (token string hoặc object chứa 2 token).
   *
   * Chú ý phần ép kiểu:
   *  - apiClient.post<TokenResponse>(...) theo type Axios sẽ trả về AxiosResponse<...>,
   *    nhưng interceptor của mình có thể đã "unwrap" để chỉ còn data.
   *  - Vì TypeScript không biết chuyện interceptor này,
   *    nên ép kiểu qua unknown rồi về Promise<TokenResponse> để compiler khỏi kêu.
   */
  login: async (data: LoginDto): Promise<TokenResponse> => {
    return await apiClient.post<TokenResponse>('/api/Auth/login', data) as unknown as Promise<TokenResponse>;
  },

  /**
   * Gọi API logout.
   *  - data: LogoutDto (userId, deviceId,...).
   *  - Trả về Promise<void> (không cần data trả về, chỉ cần biết thành công/thất bại).
   */
  logout: async (data: LogoutDto): Promise<void> => {
    return await apiClient.post<void>('/api/Auth/logout', data) as unknown as Promise<void>;
  },

  /**
   * Gọi API refresh-token.
   *  - data: RefreshTokenDto
   *  - Trả về TokenResponse (tương tự login).
   */
  refreshToken: async (data: RefreshTokenDto): Promise<TokenResponse> => {
    return await apiClient.post<TokenResponse>('/api/Auth/refresh-token', data) as unknown as Promise<TokenResponse>;
  },

  /**
   * Gửi OTP đến email.
   *  - data: SendOtpDto (email).
   *  - Trả về Promise<void>, thường chỉ cần biết gọi OK là được.
   */
  sendOtp: async (data: SendOtpDto): Promise<void> => {
    return await apiClient.post<void>('/api/Auth/send-otp', data) as unknown as Promise<void>;
  },

  /**
   * Kiểm tra OTP.
   *  - data: CheckOtpDto (email + otp).
   *  - Trả về Promise<void>, nếu sai OTP backend thường trả lỗi (4xx).
   */
  checkOtp: async (data: CheckOtpDto): Promise<void> => {
    return await apiClient.post<void>('/api/Auth/check-otp', data) as unknown as Promise<void>;
  }
};
