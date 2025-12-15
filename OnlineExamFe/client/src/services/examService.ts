/**
 * examService module.
 *
 * Contains functions for managing exams and exam attempts.
 */

import apiClient from '../utils/apiClient';
import { ExamDto, ExamGenerateResultDto } from '../types/exam';

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
  data?: ExamGenerateResultDto;
}

export interface ExamGenerateResponse {
  message: string;
  exam: ExamGenerateResultDto;
}

export const examService = {
  createExam: async (data: CreateExamForTeacherOrAdmin): Promise<ExamDto> => {
    return await apiClient.post<ExamDto>('/api/Exam/create-exam', data) as unknown as Promise<ExamDto>;
  },

  startExam: async (data: ExamStartRequest): Promise<ExamStartResponse> => {
    return await apiClient.post<ExamStartResponse>('/api/Exam/start-exam', data) as unknown as Promise<ExamStartResponse>;
  },

  generateExam: async (data: CreateExamForStudentDto): Promise<ExamGenerateResponse> => {
    return await apiClient.post<ExamGenerateResponse>('/api/Exam/generate', data) as unknown as Promise<ExamGenerateResponse>;
  },

  getStudentExams: async (studentId: number): Promise<ExamDto[]> => {
    const response = await apiClient.get<any[]>(`/api/Exam/get-by-student?studentId=${studentId}`);
    // Ensure data is typed as ExamDto[]
    return response as unknown as Promise<ExamDto[]>;
  },

  getAllExams: async (): Promise<ExamDto[]> => {
    return await apiClient.get<ExamDto[]>('/api/Exam/get-all') as unknown as Promise<ExamDto[]>;
  }
};
