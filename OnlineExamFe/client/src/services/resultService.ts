/**
 * resultService module.
 *
 * Contains functions for fetching exam results.
 */

import apiClient from '../utils/apiClient';
import { ResultItem } from '../components/ResultTable';

export type { ResultItem };

export const resultService = {
  getResultsByStudent: async (studentId: number): Promise<ResultItem[]> => {
    try {
      return await apiClient.get<ResultItem[]>(`/api/Result/student/${studentId}`) as unknown as Promise<ResultItem[]>;
    } catch (e: any) {
      // Backend chưa có endpoint -> tránh crash UI
      console.warn('Result endpoint missing, returning empty list.', e?.message || e);
      return [];
    }
  },

  getResultDetail: async (resultId: number): Promise<any> => {
    return await apiClient.get<any>(`/api/Result/${resultId}`) as unknown as Promise<any>;
  }
};
