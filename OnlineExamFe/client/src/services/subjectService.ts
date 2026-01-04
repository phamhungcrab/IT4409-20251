import apiClient from '../utils/apiClient';

/**
 * SubjectDto: Dữ liệu môn học
 */
export interface SubjectDto {
  id: number;
  name: string;
  subjectCode: string;
  totalChapters: number;
  description?: string;
}

export const subjectService = {
  /**
   * Lấy thông tin chi tiết môn học theo ID
   * GET /api/Subject/{id}
   */
  getSubjectById: async (id: number): Promise<SubjectDto> => {
    return await apiClient.get<SubjectDto>(`/api/Subject/${id}`);
  },

  /**
   * Lấy tất cả môn học (dành cho Teacher/Admin nếu cần sau này)
   * GET /api/Subject/get-all
   */
  getAllSubjects: async (): Promise<SubjectDto[]> => {
    return await apiClient.get<SubjectDto[]>('/api/Subject/get-all');
  }
};
