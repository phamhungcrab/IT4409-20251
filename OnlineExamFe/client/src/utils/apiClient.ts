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
  data?: T;
  messageCode?: number;
  isStatus?: boolean;
  status?: boolean;
  Data?: T;
  MessageCode?: number;
  IsStatus?: boolean;
  Status?: boolean;
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
// Response Interceptor: Tự động xử lý và "bóc" dữ liệu
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    // Trường hợp 0: Không có dữ liệu
    if (!res) return res;

    // Trường hợp 1: ResultApiModel chuẩn (có field status hoặc isStatus)
    // Ưu tiên check các field này để xác định thành công/thất bại
    const status = res.status ?? res.Status;
    const isStatus = res.isStatus ?? res.IsStatus;

    // Nếu tồn tại một trong hai dấu hiệu của ResultApiModel
    if (status !== undefined || isStatus !== undefined) {
      // Xác định cờ success (ưu tiên status trước)
      const success = status !== undefined ? status : isStatus;

      // Chỉ xử lý nếu success là boolean
      if (typeof success === 'boolean') {
        if (success) {
          // Thành công -> Trả về data (ưu tiên res.data rồi đến res.Data)
          return res.data ?? res.Data ?? res;
        } else {
          // Thất bại -> Reject với message lỗi
          const message = res.message ?? res.Message ?? res.data ?? res.Data ?? 'API Error';
          return Promise.reject(new Error(String(message)));
        }
      }
    }

    // Trường hợp 2: Backend trả về object chỉ có duy nhất key 'data' hoặc 'Data' (Wrapper thuần túy)
    // Ví dụ: { "data": [...] } mà không có status
    if (typeof res === 'object') {
      // Check nếu object chỉ có 1 key là 'data'
      if ('data' in res && Object.keys(res).length === 1) return res.data;
      // Check nếu object chỉ có 1 key là 'Data'
      if ('Data' in res && Object.keys(res).length === 1) return res.Data;
    }

    // Trường hợp 3: Không khớp các case trên, trả nguyên dữ liệu gốc
    return res;
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

// Mở rộng interface của Axios để TypeScript hiểu rằng response trả về là T (đã bóc data)
// thay vì AxiosResponse<T>
interface CustomAxiosInstance {
  get<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<T>;

  // Giữ lại các thuộc tính gốc của AxiosInstance mà ta không override
  interceptors: {
    request: import('axios').AxiosInterceptorManager<InternalAxiosRequestConfig>;
    response: import('axios').AxiosInterceptorManager<AxiosResponse>;
  };
  defaults: Omit<import('axios').AxiosDefaults, 'headers'> & { headers: import('axios').HeadersDefaults };
}

// Export apiClient với kiểu đã được override
export default apiClient as unknown as CustomAxiosInstance;
