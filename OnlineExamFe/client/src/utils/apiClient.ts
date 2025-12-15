import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export interface ResultApiModel<T = any> {
  data: T;
  messageCode?: number;
  isStatus?: boolean;
  status?: boolean;
}

const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;

    if (data && typeof data === 'object') {
      const hasStatus = 'status' in data;
      const hasIsStatus = 'isStatus' in data;

      if (hasStatus || hasIsStatus) {
        const result = data as ResultApiModel;
        const success = hasStatus ? result.status : result.isStatus;

        // Only treat as wrapped ResultApiModel when status/isStatus is boolean
        if (typeof success === 'boolean') {
          if (success) {
            return result.data;
          }
          return Promise.reject(new Error('API Error: Operation failed'));
        }

        // status exists but is not boolean (e.g., "create"/"in_progress"): return raw data
        return data;
      }
    }

    return data;
  },
  (error: AxiosError) => {
    if (error.response) {
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

    return Promise.reject(error);
  }
);

export default apiClient;
