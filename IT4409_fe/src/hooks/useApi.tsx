import { useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { AxiosRequestConfig } from 'axios';

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
            const response = await apiClient.request<T>(config);
            setData(response);
            return response;
        } catch (err: any) {
            setError(err?.message || 'Có lỗi xảy ra khi gọi API');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, execute };
};
