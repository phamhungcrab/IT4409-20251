import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * ResultApiModel<T>:
 * - Đây là “khung response” chuẩn mà backend thường bọc dữ liệu trả về.
 *
 * Ví dụ backend có thể trả dạng:
 * {
 *   data: <T>,
 *   status: true,
 *   messageCode: 123
 * }
 *
 * Ý nghĩa:
 * - data       : dữ liệu thật bạn cần dùng (T)
 * - status/isStatus: true/false báo thành công hay thất bại
 *
 * Lưu ý:
 * - Bạn đang có cả status và isStatus vì backend có thể dùng 2 tên khác nhau.
 * - T = any là “mặc định” nếu không truyền kiểu cụ thể.
 */
export interface ResultApiModel<T = any> {
  data: T;
  messageCode?: number;
  isStatus?: boolean;
  status?: boolean;
}

/**
 * Tạo một “axios instance” (một client gọi API riêng):
 * - baseURL: URL gốc của backend (lấy từ biến môi trường VITE_API_BASE_URL)
 * - headers: header mặc định
 *
 * Người mới cần hiểu:
 * - axios.create(...) tạo ra một “bản axios riêng” để cấu hình chung (baseURL, header, interceptor)
 * - Sau này mọi nơi chỉ import apiClient và gọi apiClient.get/post... là xong
 */
const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '',
  headers: {
    // Header mặc định là JSON
    // Lưu ý: với upload file (FormData) thì sẽ cần multipart/form-data (xem phần góp ý bên dưới)
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR (chạy TRƯỚC khi request được gửi đi):
 * - Mục tiêu: tự động gắn token vào header để backend biết bạn đã đăng nhập.
 *
 * Cơ chế:
 * - Lấy token từ localStorage
 * - Nếu có token thì set vào header 'Session'
 *
 * Lưu ý:
 * - Thông thường nhiều hệ thống dùng Authorization: Bearer <token>
 * - Hệ của bạn dùng header 'Session' => phải đồng bộ với backend.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token) {
      // config.headers.set(...) là cách set header trong Axios v1+
      config.headers.set('Session', token);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR (chạy SAU khi nhận response):
 *
 * Mục tiêu:
 * 1) “Bóc dữ liệu” để các service nhận được dữ liệu gọn (không phải response.data.data...)
 * 2) Chuẩn hóa logic thành công/thất bại dựa trên status/isStatus
 * 3) Xử lý trường hợp status không phải boolean (VD: 'create', 'in_progress'...) => trả nguyên data
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;

    // Nếu data là object thì kiểm tra xem có status/isStatus hay không
    if (data && typeof data === 'object') {
      const hasStatus = 'status' in data;
      const hasIsStatus = 'isStatus' in data;

      // Nếu có status hoặc isStatus thì có khả năng đây là ResultApiModel
      if (hasStatus || hasIsStatus) {
        const result = data as ResultApiModel;

        // Nếu có status thì ưu tiên dùng status, không có thì dùng isStatus
        const success = hasStatus ? result.status : result.isStatus;

        /**
         * Chỉ coi đây là “khung bọc chuẩn” khi success là boolean.
         * - success === true  => trả về result.data (dữ liệu thật)
         * - success === false => reject để đi vào catch
         *
         * Vì sao cần check typeof success === 'boolean'?
         * - Vì trong project của bạn có chỗ status là string:
         *   status: 'create' | 'in_progress' | 'completed'...
         * - Khi đó data không phải ResultApiModel theo kiểu boolean => ta không bóc data, trả nguyên data.
         */
        if (typeof success === 'boolean') {
          if (success) {
            return result.data;
          }
          // Nếu backend báo thất bại mà không ném HTTP error code,
          // ta tự reject để UI xử lý như một lỗi.
          return Promise.reject(new Error('API Error: Operation failed'));
        }

        // status tồn tại nhưng không phải boolean (VD: 'create', 'in_progress') => trả nguyên data
        return data;
      }
    }

    // Nếu không có status/isStatus => trả luôn data
    return data;
  },

  /**
   * ERROR INTERCEPTOR:
   * - Chạy khi request bị lỗi (HTTP 4xx/5xx hoặc network error)
   *
   * Mục tiêu:
   * - Nếu 401 => tự logout (bắn event cho app xử lý)
   * - Lấy message lỗi “đẹp” để hiển thị ra UI
   */
  (error: AxiosError) => {
    if (error.response) {
      // Lỗi có phản hồi từ server (HTTP status code tồn tại)
      if (error.response.status === 401) {
        /**
         * Bắn event 'auth:logout' để phần khác của app (AuthProvider / listener)
         * tự xử lý logout, xóa token, điều hướng về login...
         *
         * Đây là cách “tách trách nhiệm”:
         * - apiClient chỉ phát tín hiệu
         * - nơi quản lý auth sẽ nghe và xử lý
         */
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(new Error('Unauthorized'));
      }

      /**
       * Lấy message lỗi từ backend:
       * - Có nơi backend trả `message`
       * - Có nơi trả `error`
       * - Có nơi trả `Message`, `Error` (PascalCase)
       * - Có nơi trả `data` (không chuẩn nhưng vẫn gặp)
       */
      const data: any = error.response.data;
      const message =
        data?.message ||
        data?.error ||
        data?.data ||
        data?.Message ||
        data?.Error ||
        'An unexpected error occurred';

      return Promise.reject(new Error(message));
    }

    // Lỗi không có response (mất mạng, CORS, server chết...) => reject nguyên error
    return Promise.reject(error);
  }
);

export default apiClient;
