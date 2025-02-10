import { useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { AxiosRequestConfig, AxiosError } from 'axios';

interface UseApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (config: AxiosRequestConfig) => Promise<T | null>;
}

export const useApi = <T = any>(): UseApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (config: AxiosRequestConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient(config);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'An unexpected error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
};