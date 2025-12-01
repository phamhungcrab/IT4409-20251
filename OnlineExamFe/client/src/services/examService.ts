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
    // MOCK DATA: Backend missing endpoint
    console.warn('Using MOCK DATA for getStudentExams');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Mock Exam 1',
            subject: 'Mathematics',
            durationMinutes: 60,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            status: 'UPCOMING'
          },
          {
            id: 2,
            name: 'Mock Exam 2',
            subject: 'Physics',
            durationMinutes: 45,
            startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            endTime: new Date().toISOString(),
            status: 'COMPLETED'
          }
        ]);
      }, 500);
    });
    // return await apiClient.get<any[]>(`/api/Exam/student/${studentId}`) as unknown as Promise<any[]>;
  },

  submitExam: async (data: { examId: number; studentId: number; answers: any[] }): Promise<any> => {
     // MOCK DATA: Backend missing endpoint
     console.warn('Using MOCK DATA for submitExam');
     return new Promise((resolve) => {
       setTimeout(() => {
         resolve({
           message: 'Exam submitted successfully (MOCKED)',
           score: 8.5
         });
       }, 1000);
     });
     // return await apiClient.post<any>('/api/Exam/submit', data) as unknown as Promise<any>;
  },

  getAllExams: async (): Promise<any[]> => {
    // MOCK DATA: Backend missing endpoint
    console.warn('Using MOCK DATA for getAllExams');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Final Exam - Math',
            classId: 101,
            durationMinutes: 90,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 172800000).toISOString()
          },
          {
            id: 2,
            name: 'Midterm - History',
            classId: 102,
            durationMinutes: 60,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 172800000).toISOString()
          }
        ]);
      }, 500);
    });
    // return await apiClient.get<any[]>('/api/Exam/all') as unknown as Promise<any[]>;
  },

  resetExam: async (examId: number, studentId: number): Promise<any> => {
    return await apiClient.delete<any>(`/api/Exam/reset-exam/${examId}/student/${studentId}`) as unknown as Promise<any>;
  }
};