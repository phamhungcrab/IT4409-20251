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
    // Assuming endpoint exists: GET /api/Result/student/{studentId}
    // If not, we might need to adjust or use a mock
    return await apiClient.get<ResultItem[]>(`/api/Result/student/${studentId}`) as unknown as Promise<ResultItem[]>;
  },

  getResultDetail: async (resultId: number): Promise<any> => {
    return await apiClient.get<any>(`/api/Result/${resultId}`) as unknown as Promise<any>;
  }
};