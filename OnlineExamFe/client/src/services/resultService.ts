/**
 * resultService module.
 *
 * Provides functions for fetching exam results.
 * Currently, the backend does not expose a dedicated endpoint for results.
 * This service is a placeholder for future implementation.
 */

import apiClient from '../utils/apiClient';

export interface ExamResult {
  examId: number;
  studentId: number;
  score: number;
  status: string;
}

export const resultService = {
  // Placeholder for getting results
  // The backend currently handles results via ExamController state or WebSocket
  getResults: async (): Promise<ExamResult[]> => {
    // TODO: Implement when backend endpoint is available
    // For now, return empty array or mock data
    console.warn('getResults API not implemented on backend');
    return [];
  }
};