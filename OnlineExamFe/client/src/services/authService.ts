/**
 * authService (dịch vụ xác thực):
 *
 * File này gom tất cả hàm gọi API liên quan đến xác thực tài khoản:
 * - login        : đăng nhập, nhận token
 * - logout       : đăng xuất, báo cho server hủy phiên/thiết bị
 * - refreshToken : xin token mới khi token cũ sắp/hết hạn
 * - sendOtp      : gửi mã OTP tới email
 * - checkOtp     : kiểm tra OTP người dùng nhập
 *
 * Tất cả request dùng chung apiClient (axios đã cấu hình sẵn) để:
 * - Dùng chung baseURL (VD: VITE_API_BASE_URL)
 * - Có thể tự gắn header Authorization: Bearer <token> (nếu bạn cấu hình)
 * - Có thể xử lý lỗi tập trung (ví dụ: nếu 401 thì logout / refresh)
 *
 * Lưu ý cho người mới:
 * - “Service” ở FE thường chỉ là một file chứa các hàm gọi API.
 * - Nó giúp bạn không viết axios/fetch lặp lại ở nhiều nơi.
 */

import apiClient from '../utils/apiClient';

/**
 * UserRole (vai trò người dùng):
 *
 * Dùng enum để định nghĩa “tập giá trị cố định” cho role, ví dụ:
 * - Teacher, Student
 *
 * Vì sao dùng enum?
 * - Tránh gõ sai chuỗi: 'Admin' vs 'admin' vs 'Admim'
 * - Code dễ đọc hơn, có gợi ý (autocomplete) trong editor
 */
export enum UserRole {
  Teacher = 'Teacher',
  Student = 'Student'
}

/**
 * LoginDto (dữ liệu gửi lên khi đăng nhập):
 *
 * Giải thích khái niệm DTO:
 * - DTO = Data Transfer Object = “gói dữ liệu để gửi qua lại”
 * - Nói đơn giản: đây là shape (cấu trúc) dữ liệu mà FE gửi lên BE.
 *
 * Trường dữ liệu:
 * - email    : email người dùng
 * - password : mật khẩu
 *
 * Các trường “bổ sung” (không bắt buộc):
 * - ipAddress : IP của người dùng (nếu FE lấy được)
 * - userAgent : thông tin trình duyệt/thiết bị (Chrome/Windows…)
 * - deviceId  : định danh thiết bị (để quản lý đăng nhập nhiều thiết bị)
 */
export interface LoginDto {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

/**
 * RegisterDto (dữ liệu gửi lên khi đăng ký):
 *
 * Dùng khi hệ thống có form đăng ký.
 *
 * Trường dữ liệu:
 * - email       : email đăng nhập
 * - password    : mật khẩu
 * - mssv        : mã số sinh viên
 * - role        : vai trò (dùng enum UserRole)
 * - fullName    : họ tên đầy đủ
 * - dateOfBirth : ngày sinh dạng chuỗi ISO, ví dụ '2002-01-01'
 *
 * Lưu ý:
 * - ipAdress đang bị sai chính tả (đúng ra là ipAddress).
 * - Nếu backend cũng dùng ipAdress thì FE phải gửi đúng tên đó.
 * - Nếu backend dùng ipAddress thì FE nên sửa lại cho đồng bộ.
 */
export interface RegisterDto {
  email: string;
  password: string;
  mssv: string;
  role: UserRole;
  fullName: string;
  dateOfBirth: string;
  ipAdress?: string; // chú ý: field này đang khác ipAddress
  userAgent?: string;
  deviceId?: string;
}

/**
 * LogoutDto (dữ liệu gửi khi đăng xuất):
 *
 * Tùy thiết kế, backend có thể cần các thông tin để:
 * - Hủy refreshToken của đúng thiết bị (device)
 * - Log audit (ai logout, từ đâu)
 *
 * Trường dữ liệu:
 * - userId    : id người dùng
 * - deviceId  : id thiết bị (nếu có)
 * - ipAddress : IP (nếu có)
 * - userAgent : trình duyệt/thiết bị (nếu có)
 */
export interface LogoutDto {
  userId: number;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * SendOtpDto (gửi OTP):
 * - Chỉ cần email để server gửi mã OTP tới.
 */
export interface SendOtpDto {
  email: string;
}

/**
 * CheckOtpDto (kiểm tra OTP):
 * - email: email đã nhận OTP
 * - otp  : mã OTP người dùng nhập
 */
export interface CheckOtpDto {
  otp: string;
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  resetCode: string; // OTP Code
  newPassword: string;
}

export interface ChangePasswordDto {
  email: string;
  oldPassword?: string;
  newPassword: string;
}

/**
 * LoginResponse:
 * - Cấu trúc phản hồi mới từ Backend khi login thành công.
 * - Chứa cả token (sessionString) và thông tin user.
 */
export interface LoginResponse {
  sessionString: string;
  user: {
    id: number;
    mssv: string;
    fullName: string;
    email: string;
    role: string | UserRole; // Backend trả về string 'TEACHER', 'STUDENT'...
    dateOfBirth: string;
  };
}

/**
 * TokenResponse (phản hồi token từ server):
 *
 * Một số backend trả về:
 * - Cách 1: chỉ trả 1 chuỗi token (string)
 * - Cách 2: trả object chứa accessToken + refreshToken
 *
 * => Nên ta khai báo kiểu “có thể là 1 trong 2 dạng”.
 */
export type TokenResponse =
  | string
  | {
      accessToken: string;
      refreshToken: string;
    };

/**
 * RefreshTokenDto (gửi lên khi xin token mới):
 *
 * Mục đích:
 * - accessToken thường sống ngắn, hết hạn nhanh
 * - refreshToken sống lâu hơn, dùng để xin accessToken mới
 *
 * Trường dữ liệu:
 * - accessToken  : token hiện tại (có thể sắp hết hạn)
 * - refreshToken : token làm mới
 * - deviceId     : thiết bị nào đang xin refresh
 * - ipAddress    : IP thiết bị
 * - userAgent    : thông tin trình duyệt/thiết bị
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
 * - Là một object chứa các hàm gọi API liên quan đến Auth.
 * - Mỗi hàm thường tương ứng 1 endpoint backend.
 *
 * Lưu ý quan trọng cho người mới:
 * - Các hàm dưới đây đều trả về Promise.
 * - Promise nghĩa là “kết quả sẽ có sau” (vì gọi mạng cần thời gian).
 * - Vì vậy ta dùng async/await để viết code dễ đọc hơn.
 */
export const authService = {
  /**
   * login(data):
 * - Gửi POST /api/Auth/login kèm email/password.
 * - Server trả về token (TokenResponse).
 *
 * Về mặt TypeScript:
 * - apiClient.post<TokenResponse>(...) nghĩa là:
 *   “tôi mong server trả về dữ liệu có dạng TokenResponse”.
 *
 * Vì sao lại có đoạn ép kiểu `as unknown as Promise<TokenResponse>`?
 * - Do cách bạn cấu hình apiClient (axios interceptor) có thể đã “bóc” response,
 *   tức là thay vì trả AxiosResponse<T>, nó trả thẳng T.
 * - Nhưng TypeScript không tự biết điều đó, nên bạn ép kiểu để compiler không báo lỗi.
 *
 * Gợi ý tốt hơn:
 * - Nên cấu hình type của apiClient để .post trả về đúng T ngay từ đầu,
 *   để khỏi phải ép kiểu ở từng hàm.
   */
  login: async (data: LoginDto): Promise<LoginResponse> => {
    return await apiClient.post<LoginResponse>('/api/Auth/login', data);
  },

  /**
   * logout(data):
 * - Gửi POST /api/Auth/logout để server hủy phiên/refreshToken (tùy BE).
 * - Trả về Promise<void> nghĩa là không cần dữ liệu trả về,
 *   chỉ cần biết “gọi thành công” hay bị lỗi.
   */
  logout: async (data: LogoutDto): Promise<void> => {
    return (await apiClient.post<void>(
      '/api/Auth/logout',
      data
    )) as unknown as Promise<void>;
  },

  /**
   * refreshToken(data):
 * - Gửi POST /api/Auth/refresh-token để xin token mới.
 * - Trả về TokenResponse (giống login).
   */
  refreshToken: async (data: RefreshTokenDto): Promise<TokenResponse> => {
    return (await apiClient.post<TokenResponse>(
      '/api/Auth/refresh-token',
      data
    )) as unknown as Promise<TokenResponse>;
  },

  /**
   * sendOtp(data):
 * - Gửi POST /api/Auth/send-otp để server gửi OTP tới email.
 * - Thường không cần body trả về => Promise<void>.
   */
  sendOtp: async (data: SendOtpDto): Promise<void> => {
    return (await apiClient.post<void>(
      '/api/Auth/send-otp',
      data
    )) as unknown as Promise<void>;
  },

  /**
   * checkOtp(data):
 * - Gửi POST /api/Auth/check-otp để server kiểm tra OTP.
 * - Nếu OTP đúng -> OK
 * - Nếu OTP sai -> server thường trả lỗi 4xx và axios sẽ throw error
   */
  checkOtp: async (data: CheckOtpDto): Promise<string> => {
    // Backend returns a resetToken in the Data field upon success
    const response = await apiClient.post<any>('/api/Auth/check-otp', data);
    return response.data; // This should be the reset token GUID
  },

  resetPassword: async (data: ResetPasswordDto): Promise<void> => {
    return await apiClient.post<void>('/api/Auth/reset-password', data);
  },

  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    return await apiClient.post<void>('/api/Auth/change-password', data);
  }
};
