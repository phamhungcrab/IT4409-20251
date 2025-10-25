/**
 * useApi hook.
 *
 * Provides helper functions for making HTTP requests to your backend API.
 * It automatically includes the current JWT token from the auth context
 * in the `Authorization` header and handles simple error cases like
 * unauthorized responses.  You can extend this hook to include
 * additional methods (e.g. PATCH), global error handling, or request
 * interceptors.  The base URL is read from the `VITE_API_BASE_URL`
 * environment variable at build time.
 */

import { useCallback } from 'react';
import useAuth from './useAuth';

interface ApiClient {
  get: <T = any>(path: string) => Promise<T>;
  post: <T = any, B = any>(path: string, body: B) => Promise<T>;
  put: <T = any, B = any>(path: string, body: B) => Promise<T>;
  del: <T = any>(path: string) => Promise<T>;
}

export default function useApi(): ApiClient {
  const { token, logout } = useAuth();
  // Use Vite env variable if provided; otherwise default to empty string
  const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';

  /**
   * Internal helper to perform a fetch with the appropriate headers and
   * error handling.  It returns the parsed JSON response.  If the
   * response has a 401 status, it logs the user out to clear stale
   * credentials.  Other status codes throw an error with a generic
   * message; extend this as needed to handle more specific cases.
   */
  const request = useCallback(
    async <T>(path: string, options: RequestInit = {}): Promise<T> => {
      const headers = new Headers(options.headers || {});
      headers.set('Content-Type', 'application/json');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
      if (response.status === 401) {
        // Token invalid or expired; force logout
        logout();
        throw new Error('Unauthorized. Please login again.');
      }
      if (!response.ok) {
        // Attempt to extract error message from server response
        let message = 'API request failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            message = errorData.message;
          }
        } catch {
          // Ignore JSON parsing errors
        }
        throw new Error(message);
      }
      // Assume JSON response for successful requests
      return (await response.json()) as T;
    },
    [baseUrl, token, logout]
  );

  return {
    get: async <T>(path: string): Promise<T> => {
      return await request<T>(path, { method: 'GET' });
    },
    post: async <T, B>(path: string, body: B): Promise<T> => {
      return await request<T>(path, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    put: async <T, B>(path: string, body: B): Promise<T> => {
      return await request<T>(path, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
    del: async <T>(path: string): Promise<T> => {
      return await request<T>(path, { method: 'DELETE' });
    },
  };
}