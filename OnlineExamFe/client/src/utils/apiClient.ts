import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * ResultApiModel:
 *  - Đây là "mẫu khung" (wrapper) mà backend hay dùng khi trả dữ liệu về.
 *  - Thay vì trả data thô, backend gói vào object có dạng:
 *      {
 *        data: ...,
 *        messageCode: ...,
 *        isStatus: true/false,
 *        status: true/false
 *      } 
 *
 *  - <T = any> nghĩa là kiểu dữ liệu của data có thể generic (tùy endpoint).
 *    Ví dụ:
 *      - ResultApiModel<User>
 *      - ResultApiModel<Exam[]>
 */
export interface ResultApiModel<T = any> {
  data: T;
  messageCode?: number;
  isStatus?: boolean; // Một số API dùng field isStatus để thể hiện thành công/thất bại
  status?: boolean;   // Một số API khác (login/user) dùng field status
}

/**
 * Tạo một instance Axios riêng (apiClient) để gọi API.
 *
 * Vì sao cần instance riêng?
 *  - Đặt baseURL chung cho mọi request.
 *  - Cấu hình header mặc định (Content-Type,...).
 *  - Thêm interceptor (request/response) xử lý token, lỗi, unwrap ResultApiModel,...
 */
const apiClient = axios.create({
  /**
   * baseURL:
   *  - Nếu có biến môi trường VITE_API_BASE_URL (production: trỏ về server deploy),
   *    thì dùng biến đó.
   *  - Nếu không có (ví dụ chạy dev, dùng proxy của Vite), để chuỗi rỗng ''.
   *
   * (import.meta as any).env là cách Vite đọc biến môi trường từ .env.
   */
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 *  - Chạy TRƯỚC MỖI request gửi lên backend.
 *  - Dùng để:
 *      + Gắn token vào header.
 *      + Ghi log request.
 *      + Sửa config request nếu cần.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage (giả sử đã được lưu khi login)
    const token = localStorage.getItem('token');

    // Nếu có token thì gắn vào header "Session"
    // (Backend của bạn đang kỳ vọng token nằm trong header Session)
    if (token) {
      config.headers.set('Session', token);
    }

    // BẮT BUỘC phải return config để request tiếp tục được gửi đi
    return config;
  },
  // Nếu có lỗi trong quá trình tạo request (rất hiếm), reject Promise để đi vào catch()
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 *  - Chạy SAU KHI nhận được response từ backend.
 *  - Dùng để:
 *      + Unwrap ResultApiModel (lấy thẳng result.data thay vì phải .data.data).
 *      + Bắt lỗi 401 để logout toàn app.
 *      + Chuẩn hóa thông báo lỗi trả về (Error(message)).
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Lấy dữ liệu thật sự từ response (Axios luôn để body trong response.data)
    const data = response.data;

    // Nếu data là object, ta kiểm tra xem nó có theo cấu trúc ResultApiModel không
    if (data && typeof data === 'object') {
      // Kiểm tra xem có field status hoặc isStatus hay không
      const hasStatus = 'status' in data;
      const hasIsStatus = 'isStatus' in data;

      if (hasStatus || hasIsStatus) {
        const result = data as ResultApiModel;
        // Chọn field đang được backend dùng: ưu tiên status, nếu không có thì dùng isStatus
        const success = hasStatus ? result.status : result.isStatus;

        if (success) {
          // Trường hợp API trả thành công (status/isStatus = true):
          // → Trả về thẳng result.data để FE dùng luôn, đỡ phải .data.data
          return result.data;
        } else {
          // Trường hợp HTTP code vẫn là 200 (OK) nhưng trong body báo thất bại (status = false)
          // → Đây là "thất bại logic", ta chủ động reject để đi vào catch() phía trên FE.
          return Promise.reject(new Error('API Error: Operation failed'));
        }
      }
    }

    // Nếu không phải kiểu ResultApiModel:
    // → Giả sử đây là endpoint trả data "thô" (raw), return luôn cho FE dùng.
    return data;
  },
  async (error: AxiosError) => {
    // Nếu server có trả về response (tức là request đã tới server, nhưng bị lỗi)
    if (error.response) {
      // Nếu status code là 401 (Unauthorized: không có quyền / token sai / token hết hạn)
      if (error.response.status === 401) {
        /**
         * Phát ra một "sự kiện" (Event) trên window với tên 'auth:logout'.
         *  - Các phần khác của app (ví dụ trong useAuth) có thể lắng nghe (addEventListener)
         *    sự kiện này để tự động:
         *      + Xóa token
         *      + Redirect về trang login
         *  - Cách này giúp tách logic xử lý 401 ra khỏi apiClient, code gọn mà vẫn tập trung.
         */
        window.dispatchEvent(new Event('auth:logout'));

        // Trả về lỗi Unauthorized cho caller (để catch được nếu cần)
        return Promise.reject(new Error('Unauthorized'));
      }

      // Các lỗi khác (400, 403, 500,...) thì cố gắng lấy message từ body do backend trả
      const data = error.response.data as any;
      const message =
        data?.message ||    // nếu backend trả field message
        data?.error ||      // hoặc field error
        'An unexpected error occurred'; // fallback nếu không có gì cụ thể

      return Promise.reject(new Error(message));
    }

    // Nếu không có error.response (lỗi network, không tới được server,...),
    // return nguyên error để chỗ khác tự xử lý.
    return Promise.reject(error);
  }
);

export default apiClient;
