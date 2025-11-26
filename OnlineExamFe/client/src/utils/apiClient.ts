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
  (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
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
