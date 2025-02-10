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
  classId: number;
  blueprintId: number;
  durationMinutes: number;
}

export interface CreateExamForStudentDto {
  examId: number;
  studentId: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
}

export interface ExamStartResponse {
  status: string;
  wsUrl: string;
  examForStudent?: any; // Define specific type if available
}

export interface ExamGenerateResponse {
  message: string;
  exam: any; // Define specific type if available
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
    // Assuming endpoint exists or using a placeholder.
    return await apiClient.get<any[]>(`/api/Exam/student/${studentId}`) as unknown as Promise<any[]>;
  },

  submitExam: async (data: { examId: number; studentId: number; answers: any[] }): Promise<any> => {
     return await apiClient.post<any>('/api/Exam/submit', data) as unknown as Promise<any>;
  },

  getAllExams: async (): Promise<any[]> => {
    return await apiClient.get<any[]>('/api/Exam/all') as unknown as Promise<any[]>;
  }
};