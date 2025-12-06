/**
 * examService module.
 *
 * Contains functions for managing exams and exam attempts.
 */

import apiClient from '../utils/apiClient';

export interface CreateExamForTeacherOrAdmin {
  name: string;
  classId: number;
  blueprintId: number;
  durationMinutes: number;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export interface ExamStartRequest {
  examId: number;
  studentId: number;
}

export interface GeneratedQuestion {
  id: number;
  order: number;
  content: string;
  cleanAnswer: string[];
  type: number;
  difficulty: number;
  point: number;
  chapter: number;
  imageUrl?: string;
}

export interface ExamGenerateResult {
  examId: number;
  name: string;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  classId: number;
  blueprintId?: number;
  questions: GeneratedQuestion[];
}

export interface CreateExamForStudentDto {
  examId: number;
  studentId: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
}

export interface ExamStartResponse {
  status: 'create' | 'in_progress' | 'completed' | 'expired';
  wsUrl?: string;
  data?: ExamGenerateResult;
}

export interface ExamGenerateResponse {
  message: string;
  exam: ExamGenerateResult;
}

export const examService = {
  createExam: async (data: CreateExamForTeacherOrAdmin): Promise<any> => {
    return await apiClient.post<any>('/api/Exam/create-exam', data) as unknown as Promise<any>;
  },

  startExam: async (data: ExamStartRequest): Promise<ExamStartResponse> => {
    return await apiClient.post<ExamStartResponse>('/api/Exam/start-exam', data) as unknown as Promise<ExamStartResponse>;
  },

  generateExam: async (data: CreateExamForStudentDto): Promise<ExamGenerateResponse> => {
    return await apiClient.post<ExamGenerateResponse>('/api/Exam/generate', data) as unknown as Promise<ExamGenerateResponse>;
  },

  getStudentExams: async (studentId: number): Promise<any[]> => {
    return await apiClient.get<any[]>(`/api/Exam/get-by-student?studentId=${studentId}`) as unknown as Promise<any[]>;
  },

  getAllExams: async (): Promise<any[]> => {
    return await apiClient.get<any[]>('/api/Exam/get-all') as unknown as Promise<any[]>;
  }
};
