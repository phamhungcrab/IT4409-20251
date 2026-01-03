import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';


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

const apiClient = axios.create({
    baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '',
    headers: {
        // Header mặc định là JSON
        // Lưu ý: với upload file (FormData) thì sẽ cần multipart/form-data (xem phần góp ý bên dưới)
        'Content-Type': 'application/json',
    },
});

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

    (error: AxiosError) => {
        if (error.response) {
            // Lỗi có phản hồi từ server (HTTP status code tồn tại)
            if (error.response.status === 401) {

                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(new Error('Unauthorized'));
            }

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
    request<T = any>(config: import('axios').AxiosRequestConfig): Promise<T>;

    get<T = any>(url: string, config?: import('axios').AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: import('axios').AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: import('axios').AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: import('axios').AxiosRequestConfig): Promise<T>;

    interceptors: {
        request: import('axios').AxiosInterceptorManager<import('axios').InternalAxiosRequestConfig>;
        response: import('axios').AxiosInterceptorManager<import('axios').AxiosResponse>;
    };

    defaults: Omit<import('axios').AxiosDefaults, 'headers'> & {
        headers: import('axios').HeadersDefaults;
    };
}

// Export apiClient với kiểu đã được override
export default apiClient as unknown as CustomAxiosInstance;