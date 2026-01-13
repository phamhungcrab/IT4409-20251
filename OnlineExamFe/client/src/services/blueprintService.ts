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
   * getBySubjectId(subjectId):
   * - Lấy danh sách Blueprint theo subjectId (filter từ getAll)
   */
  getBySubjectId: async (subjectId: number): Promise<Blueprint[]> => {
    const all = await apiClient.get<Blueprint[]>('/api/ExamBlueprint/get-all');
    return all.filter(b => b.subjectId === subjectId);
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
  },

  /**
   * deleteBlueprint(id):
   * - Xóa Blueprint theo ID
   * - Gọi DELETE /api/ExamBlueprint/delete/{id}
   */
  deleteBlueprint: async (id: number): Promise<void> => {
    return await apiClient.delete<void>(`/api/ExamBlueprint/delete/${id}`);
  },

  /**
   * updateBlueprint(id, data):
   * - Cập nhật Blueprint theo ID
   * - Gọi PUT /api/ExamBlueprint/update/{id}
   */
  updateBlueprint: async (id: number, data: CreateBlueprintDto): Promise<Blueprint> => {
    return await apiClient.put<Blueprint>(`/api/ExamBlueprint/update/${id}`, data);
  },

  /**
   * getByClass(classId):
   * - Lấy danh sách Exam cùng với Blueprint theo classId
   * - Gọi GET /api/ExamBlueprint/by-class/{classId}
   */
  getByClass: async (classId: number): Promise<ExamWithBlueprintSimple[]> => {
    return await apiClient.get<ExamWithBlueprintSimple[]>(`/api/ExamBlueprint/by-class/${classId}`);
  }
};

/**
 * ExamWithBlueprintSimple:
 * - Response từ API by-class
 */
export interface ExamWithBlueprintSimple {
  examId: number;
  examName: string;
  startTime: string;
  endTime: string;
  blueprintId: number | null;
  blueprintCreatedAt: string | null;
}
