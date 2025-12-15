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

const unwrap = <T>(res: any): T => {
  if (res && typeof res === 'object') {
    if ('data' in res) return res.data as T;
    if ('Data' in res) return (res as any).Data as T;
  }
  return res as T;
};

export const classService = {
  getAll: async (): Promise<ClassDto[]> => {
    const res = await apiClient.get<any>('/api/CLass/get-all');
    return unwrap<ClassDto[]>(res);
  },

  getByTeacherAndSubject: async (teacherId: number, subjectId?: number): Promise<ClassDto[]> => {
    const url = subjectId
      ? `/api/CLass/get-by-teacher-and-subject?teacherId=${teacherId}&subjectId=${subjectId}`
      : `/api/CLass/get-by-teacher-and-subject?teacherId=${teacherId}`;
    const res = await apiClient.get<any>(url);
    return unwrap<ClassDto[]>(res);
  },

  create: async (data: CreateClassDto): Promise<any> => {
    const res = await apiClient.post<any>('/api/CLass/create', data);
    return unwrap<any>(res);
  },

  getStudentsByClass: async (classId: number): Promise<any[]> => {
    const res = await apiClient.get<any>(`/api/CLass/get-students?classId=${classId}`);
    return unwrap<any[]>(res);
  }
};
