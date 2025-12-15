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
      const raw = await apiClient.get<any[]>(`/api/Result/student/${studentId}`);
      return (raw || []).map((r: any) => ({
        examId: r.examId ?? r.ExamId ?? r.id ?? r.Id,
        examTitle: r.examName ?? r.ExamName ?? `Exam ${r.examId ?? r.Id ?? ''}`,
        score: Number(r.score ?? r.Score ?? 0),
        status: r.status ?? r.Status ?? '',
        submittedAt: r.submittedAt ?? r.SubmittedAt
      })) as ResultItem[];
    } catch (e: any) {
      // Backend chưa có endpoint -> tránh crash UI
      console.warn('Result endpoint missing, returning empty list.', e?.message || e);
      return [];
    }
  },

  getResultDetail: async (studentId: number, examId: number): Promise<any> => {
    return await apiClient.get<any>(`/api/Result/detail?studentId=${studentId}&examId=${examId}`) as unknown as Promise<any>;
  }
};

