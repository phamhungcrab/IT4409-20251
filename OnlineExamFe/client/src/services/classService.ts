import apiClient from '../utils/apiClient';

export interface ClassDto {
  id: number;
  name: string;
  teacherId: number;
  subjectId: number;
  subjectName?: string;
  teacherName?: string;
  studentCount?: number; // Optional, might be in response
}

export interface CreateClassDto {
  name: string;
  teacherId: number;
  subjectId: number;
}

export const classService = {
  getAll: async (): Promise<ClassDto[]> => {
    return await apiClient.get<ClassDto[]>('/api/CLass/get-all') as unknown as Promise<ClassDto[]>;
  },

  getByTeacherAndSubject: async (teacherId: number, subjectId?: number): Promise<ClassDto[]> => {
    const url = subjectId
      ? `/api/CLass/get-by-teacher-and-subject?teacherId=${teacherId}&subjectId=${subjectId}`
      : `/api/CLass/get-by-teacher-and-subject?teacherId=${teacherId}`;
    return await apiClient.get<ClassDto[]>(url) as unknown as Promise<ClassDto[]>;
  },

  create: async (data: CreateClassDto): Promise<any> => {
    return await apiClient.post<any>('/api/CLass/create', data) as unknown as Promise<any>;
  },

  getStudentsByClass: async (classId: number): Promise<any[]> => {
    return await apiClient.get<any[]>(`/api/CLass/get-students/${classId}`) as unknown as Promise<any[]>;
  }
};
