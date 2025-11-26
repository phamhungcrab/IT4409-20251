/**
 * useApi hook.
 *
 * Provides helper functions for making HTTP requests to your backend API.
 * Uses the centralized apiClient for configuration and interceptors.
 */

import { useCallback } from 'react';
import apiClient from '../utils/apiClient';

interface ApiClient {
  get: <T = any>(path: string, params?: any) => Promise<T>;
  post: <T = any, B = any>(path: string, body: B) => Promise<T>;
  put: <T = any, B = any>(path: string, body: B) => Promise<T>;
  del: <T = any>(path: string) => Promise<T>;
}

export default function useApi(): ApiClient {
  const get = useCallback(async <T>(path: string, params?: any): Promise<T> => {
    return await apiClient.get<T, T>(path, { params });
  }, []);

  const post = useCallback(async <T, B>(path: string, body: B): Promise<T> => {
    return await apiClient.post<T, T>(path, body);
  }, []);

  const put = useCallback(async <T, B>(path: string, body: B): Promise<T> => {
    return await apiClient.put<T, T>(path, body);
  }, []);

  const del = useCallback(async <T>(path: string): Promise<T> => {
    return await apiClient.delete<T, T>(path);
  }, []);

  return { get, post, put, del };
}