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
    // API /api/Exam/get-by-student is missing in Swagger and Backend.
    // Mocking response to allow UI to function as requested.
    console.warn('Mocking getStudentExams due to missing API');
    return [
        {
            id: 1,
            name: 'Kỳ thi Cuối kỳ (Mock)',
            classId: 1,
            blueprintId: 1,
            durationMinutes: 60,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(), // +1 day
            status: 'OPEN'
        }
    ] as any[];
    // Original call:
    // return await apiClient.get<any[]>(`/api/Exam/get-by-student?studentId=${studentId}`) as unknown as Promise<any[]>;
  },

  submitExam: async (data: { examId: number; studentId: number; answers: any[] }): Promise<any> => {
     return await apiClient.post<any>('/api/Result/submit', data) as unknown as Promise<any>;
  },

  getAllExams: async (): Promise<any[]> => {
    // API /api/Exam/get-all is missing in Swagger and Backend.
    // Mocking response for Teachers/Admins.
    console.warn('Mocking getAllExams due to missing API');
    return [
        {
            id: 1,
            name: 'Kỳ thi Cuối kỳ (Mock)',
            classId: 1,
            blueprintId: 1,
            durationMinutes: 60,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'OPEN'
        }
    ] as any[];
    // Original call:
    // return await apiClient.get<any[]>('/api/Exam/get-all') as unknown as Promise<any[]>;
  },

  resetExam: async (examId: number, studentId: number): Promise<any> => {
    return await apiClient.delete<any>(`/api/Exam/reset-exam/${examId}/student/${studentId}`) as unknown as Promise<any>;
  }
};