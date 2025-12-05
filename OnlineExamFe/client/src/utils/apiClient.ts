import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Define the shape of the backend's standard wrapper
export interface ResultApiModel<T = any> {
  data: T;
  messageCode?: number;
  isStatus?: boolean; // Some endpoints might use this
  status?: boolean;   // Login/User endpoints use this
}

// Create Axios instance
const apiClient = axios.create({
  baseURL: '', // Force relative path to use Vite Proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Session Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.set('Session', token);
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
    if (data && typeof data === 'object') {
      // Check for either status or isStatus
      const hasStatus = 'status' in data;
      const hasIsStatus = 'isStatus' in data;

      if (hasStatus || hasIsStatus) {
        const result = data as ResultApiModel;
        // Use the property that exists
        const success = hasStatus ? result.status : result.isStatus;

        if (success) {
          return result.data; // Unwrap and return the actual data
        } else {
          // API returned success HTTP code but logical failure
          return Promise.reject(new Error('API Error: Operation failed'));
        }
      }
    }
    // Fallback for endpoints returning raw data
    return data;
  },
  async (error: AxiosError) => {
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
