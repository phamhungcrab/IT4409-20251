/**
 * resultService (dịch vụ kết quả thi):
 *
 * APIs:
 * - GET /api/Exam/student/{studentId}/exams - Lấy danh sách exams
 * - GET /api/Exam/exams/{examId}/result-summary?studentId={studentId} - Lấy điểm tổng quát
 * - GET /api/Exam/detail?examId={examId}&studentId={studentId} - Lấy chi tiết bài làm
 */

import apiClient from '../utils/apiClient';
import { ResultItem } from '../components/ResultTable';

export type { ResultItem };

/**
 * Interface cho exam từ API student exams
 */
export interface StudentExam {
  examId: number;
  examName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: string | null; // null = chưa làm, "in_progress", "COMPLETED"
}

/**
 * Interface cho response từ API result-summary
 */
export interface ResultSummary {
  examId: number;
  studentId: number;
  totalQuestions: number;
  correctCount: number;
  totalQuestionPoint: number;
  studentEarnedPoint: number;
  finalScore: number;
}

/**
 * Interface cho chi tiết từng câu hỏi trong bài thi
 */
export interface QuestionDetail {
  questionId: number;
  order: number;
  content: string;
  studentAnswer: string;
  correctAnswer: string;
  cleanAnswer: string[];
  isCorrect: boolean;
  questionPoint: number;
  studentPoint: number;
}

/**
 * Interface cho response từ API detail
 */
export interface ExamDetailResult {
  examId: number;
  examName: string;
  studentId: number;
  startTimeStudent: string;
  endTimeStudent: string;
  startTimeExam: string;
  endTimeExam: string;
  durationMinutes: number;
  totalPoint: number;
  totalQuestions: number;
  correctCount: number;
  details: QuestionDetail[];
}

export const resultService = {
  /**
   * getStudentExams(studentId):
   * Lấy danh sách tất cả exams của sinh viên
   *
   * API: GET /api/Exam/student/{studentId}/exams
   */
  getStudentExams: async (studentId: number): Promise<StudentExam[]> => {
    try {
      const data = await apiClient.get<StudentExam[]>(
        `/api/Exam/student/${studentId}/exams`
      );
      return (data as unknown as StudentExam[]) || [];
    } catch (e: any) {
      console.warn('Không lấy được danh sách exams:', e?.message);
      return [];
    }
  },

  /**
   * getResultSummary(examId, studentId):
   * Lấy tổng hợp điểm của 1 bài thi
   *
   * API: GET /api/Exam/exams/{examId}/result-summary?studentId={studentId}
   */
  getResultSummary: async (examId: number, studentId: number): Promise<ResultSummary | null> => {
    try {
      const data = await apiClient.get<ResultSummary>(
        `/api/Exam/exams/${examId}/result-summary?studentId=${studentId}`
      );
      return data as unknown as ResultSummary;
    } catch (e: any) {
      console.warn(`Không lấy được result-summary cho exam ${examId}:`, e?.message);
      return null;
    }
  },

  /**
   * getExamDetail(examId, studentId):
   * Lấy chi tiết bài làm (câu hỏi, đáp án đã chọn, đáp án đúng...)
   *
   * API: GET /api/Exam/detail?examId={examId}&studentId={studentId}
   */
  getExamDetail: async (examId: number, studentId: number): Promise<ExamDetailResult | null> => {
    try {
      const data = await apiClient.get<any>(
        `/api/Exam/detail?examId=${examId}&studentId=${studentId}`
      );
      // Nếu có message lỗi thì coi như không có kết quả
      if (data && (data as any).message) {
        return null;
      }
      return data as unknown as ExamDetailResult;
    } catch (e: any) {
      console.warn(`Không lấy được exam detail cho exam ${examId}:`, e?.message);
      return null;
    }
  },

  /**
   * getResultsByStudent(studentId):
   * Lấy danh sách kết quả thi của sinh viên (CHỈ những bài COMPLETED)
   *
   * Flow:
   * 1. Lấy danh sách exams của sinh viên
   * 2. Lọc những bài có status = "COMPLETED"
   * 3. Với mỗi bài, gọi result-summary để lấy điểm
   * 4. Trả về danh sách ResultItem[] cho UI
   */
  getResultsByStudent: async (studentId: number): Promise<ResultItem[]> => {
    try {
      // Bước 1: Lấy danh sách exams của sinh viên
      const exams = await resultService.getStudentExams(studentId);

      if (!exams || exams.length === 0) {
        return [];
      }

      // Bước 2: Lọc chỉ lấy bài COMPLETED
      const completedExams = exams.filter(
        (exam) => exam.status?.toUpperCase() === 'COMPLETED'
      );

      if (completedExams.length === 0) {
        return [];
      }

      // Bước 3: Với mỗi bài, lấy result-summary
      const results: ResultItem[] = [];

      for (const exam of completedExams) {
        const summary = await resultService.getResultSummary(exam.examId, studentId);

        results.push({
          examId: exam.examId,
          examTitle: exam.examName || `Bài thi #${exam.examId}`,
          score: summary?.finalScore ?? 0,
          status: 'completed',
          submittedAt: exam.endTime || '',
          // Thêm thông tin bổ sung
          correctCount: summary?.correctCount,
          totalQuestions: summary?.totalQuestions
        });
      }

      return results;
    } catch (e: any) {
      console.warn('Không thể lấy danh sách kết quả:', e?.message || e);
      return [];
    }
  },

  /**
   * getResultDetail(studentId, examId):
   * Backward compatible - gọi getExamDetail
   */
  getResultDetail: async (studentId: number, examId: number): Promise<ExamDetailResult | null> => {
    return resultService.getExamDetail(examId, studentId);
  }
};
