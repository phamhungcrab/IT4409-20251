import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Define the shape of the backend's standard wrapper
export interface ResultApiModel<T = any> {
  data: T;
  messageCode?: number;
  isStatus: boolean;
}

// Create Axios instance
const apiClient = axios.create({
  baseURL: (import.meta as any).env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle ResultApiModel and Errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if the response follows ResultApiModel structure
    const data = response.data;
    if (data && typeof data === 'object' && 'isStatus' in data) {
      const result = data as ResultApiModel;
      if (result.isStatus) {
        return result.data; // Unwrap and return the actual data
      } else {
        // API returned success HTTP code but logical failure
        return Promise.reject(new Error('API Error: Operation failed'));
      }
    }
    // Fallback for endpoints returning raw data (like ExamController)
    return data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const token = localStorage.getItem('token');

          if (refreshToken && token) {
             // Import authService dynamically to avoid circular dependency if possible,
             // or use a direct axios call. Direct axios is safer here to avoid interceptor loops.
             // But we need the DTO structure.
             // Let's manually construct the refresh call to avoid importing authService which imports apiClient.
             const response = await axios.post((import.meta as any).env.VITE_API_BASE_URL + '/api/AuthController/refresh-token', {
                accessToken: token,
                refreshToken: refreshToken,
                deviceId: "browser", // TODO: Get real device ID
                ipAddress: "127.0.0.1", // TODO: Get real IP
                userAgent: navigator.userAgent
             });

             if (response.data && response.data.isStatus) {
                const newToken = response.data.data.accessToken;
                const newRefreshToken = response.data.data.refreshToken;

                localStorage.setItem('token', newToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
                return apiClient(originalRequest);
             }
          }
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          // Fall through to logout
        }

        // Dispatch a custom event so the app can listen and logout
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(new Error('Unauthorized'));
      }

      // Try to extract backend error message
      const data = error.response.data as any;
      const message = data?.message || data?.error || 'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
