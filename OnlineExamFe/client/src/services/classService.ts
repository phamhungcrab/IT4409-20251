import apiClient from '../utils/apiClient';

/**
 * ClassDto:
 * - "Dto" = Data Transfer Object = gói dữ liệu trao đổi giữa FE và BE.
 * - Đây là kiểu dữ liệu "lớp học" mà backend trả về cho frontend.
 */
export interface ClassDto {
  id: number;
  name: string;
  teacherId: number;
  subjectId: number;
  subjectName?: string;
  teacherName?: string;
  studentCount?: number;
  // Thêm từ API get-by-subject-for-teacher
  teacher?: {
    id: number;
    mssv: string;
    fullName: string;
    email: string;
    role: string;
  };
  subject?: {
    id: number;
    name: string;
    subjectCode: string;
    totalChapters: number;
  };
  exams?: Array<{
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
  }>;
}

/**
 * CreateClassDto:
 * - Kiểu dữ liệu frontend gửi lên khi tạo lớp mới.
 */
export interface CreateClassDto {
  name: string;
  teacherId: number;
  subjectId: number;
}

export const classService = {
  /**
   * getAll():
   * - Gọi API lấy tất cả lớp.
   */
  getAll: async (): Promise<ClassDto[]> => {
    return await apiClient.get<ClassDto[]>('/api/CLass/get-all') as unknown as ClassDto[];
  },

  /**
   * getByTeacherAndSubject(teacherId, subjectId?):
   * - Lấy danh sách lớp theo giáo viên (teacherId)
   * - API trả về thông tin lớp, môn học, và danh sách bài thi
   */
  getByTeacherAndSubject: async (teacherId: number, subjectId?: number): Promise<ClassDto[]> => {
    const url = subjectId
      ? `/api/CLass/get-by-subject-for-teacher?teacherId=${teacherId}&subjectId=${subjectId}`
      : `/api/CLass/get-by-subject-for-teacher?teacherId=${teacherId}`;

    return await apiClient.get<ClassDto[]>(url) as unknown as ClassDto[];
  },

  /**
   * create(data):
   * - Tạo lớp mới
   */
  create: async (data: CreateClassDto): Promise<any> => {
    return await apiClient.post<any>('/api/CLass/create', data);
  },

  /**
   * getById(classId):
   * - Lấy chi tiết 1 lớp học kèm các kỳ thi
   */
  getById: async (classId: number): Promise<ClassDto> => {
    return await apiClient.get<ClassDto>(`/api/CLass/get-by-id/${classId}`) as unknown as ClassDto;
  },

  /**
   * getStudentsByClass(classId):
   * - Lấy danh sách sinh viên thuộc một lớp
   * @param classId ID lớp học
   */
  getStudentsByClass: async (classId: number): Promise<any[]> => {
    return await apiClient.get<any[]>(`/api/CLass/get-students?classId=${classId}`) as unknown as any[];
  }
};
