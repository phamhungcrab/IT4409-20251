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

  // Missing endpoint in Swagger to get students of a class specifically,
  // checking if /api/User/get-by-class exists or if ClassDto includes students.
  // For now, we might need to mock this or fetch all users and filter (inefficient).
  getStudentsByClass: async (classId: number): Promise<any[]> => {
    // TODO: Replace with actual endpoint when available.
    console.warn('Mocking getStudentsByClass');
    return [
       { id: 101, fullName: 'Nguyen Van A', email: 'a@test.com', mssv: '20201234' },
       { id: 102, fullName: 'Tran Thi B', email: 'b@test.com', mssv: '20205678' }
    ];
  }
};
