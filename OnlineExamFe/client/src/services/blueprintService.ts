import apiClient from '../utils/apiClient';

/**
 * BlueprintChapter:
 * - Cấu trúc câu hỏi cho 1 chương
 */
export interface BlueprintChapter {
  chapter: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  veryHardCount: number;
}

/**
 * CreateBlueprintDto:
 * - Data gửi lên khi tạo Blueprint mới
 */
export interface CreateBlueprintDto {
  subjectId: number;
  chapters: BlueprintChapter[];
}

/**
 * Blueprint:
 * - Cấu trúc đề thi
 */
export interface Blueprint {
  id: number;
  subjectId: number;
  createdAt: string;
  totalQuestions?: number;
  chapters?: BlueprintChapter[];
}

export const blueprintService = {
  /**
   * getAll():
   * - Lấy danh sách tất cả Blueprint
   */
  getAll: async (): Promise<Blueprint[]> => {
    return await apiClient.get<Blueprint[]>('/api/ExamBlueprint/get-all');
  },

  /**
   * getById(id):
   * - Lấy chi tiết 1 Blueprint
   */
  getById: async (id: number): Promise<Blueprint> => {
    return await apiClient.get<Blueprint>(`/api/ExamBlueprint/${id}`);
  },

  /**
   * create(data):
   * - Tạo Blueprint mới
   */
  create: async (data: CreateBlueprintDto): Promise<Blueprint> => {
    return await apiClient.post<Blueprint>('/api/ExamBlueprint/create', data);
  }
};
