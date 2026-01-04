/**
 * questionService (dịch vụ câu hỏi):
 *
 * File này gom các hàm gọi API liên quan đến quản lý câu hỏi:
 * - Lấy danh sách câu hỏi
 * - Lấy chi tiết 1 câu hỏi theo id
 * - Tạo / Sửa / Xóa câu hỏi
 * - Import câu hỏi từ file (upload file)
 *
 * Mục đích của service:
 * - Component (UI) không cần biết endpoint cụ thể, chỉ gọi hàm.
 * - Dễ bảo trì: đổi endpoint / đổi cấu trúc dữ liệu chỉ sửa ở đây.
 */

import apiClient from '../utils/apiClient';

/**
 * QuestionDifficulty (độ khó câu hỏi):
 *
 * Dùng enum để cố định các mức độ khó.
 * Ưu điểm:
 * - Tránh gõ sai (VD: "easy", "EASY", "eassy"...)
 * - Khi code sẽ có gợi ý và kiểm tra kiểu (TypeScript)
 *
 * Vì sao enum dùng số (1,2,3,4)?
 * - Thường backend lưu dạng số (tinyint/int) để tối ưu.
 * - FE dùng enum để code dễ đọc nhưng vẫn gửi số lên BE.
 */
export enum QuestionDifficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3,
  VeryHard = 4
}

/**
 * QuestionType (loại câu hỏi):
 *
 * - SINGLE_CHOICE   : chọn 1 đáp án (radio)
 * - MULTIPLE_CHOICE : chọn nhiều đáp án (checkbox)
 *
 * Lưu ý:
 * - Ở đây enum bắt đầu từ 0 (0/1).
 * - Quan trọng nhất là FE và BE phải thống nhất cùng quy ước.
 */
export enum QuestionType {
  SINGLE_CHOICE = 0,
  MULTIPLE_CHOICE = 1
}

/**
 * Question:
 * - Kiểu dữ liệu câu hỏi mà backend trả về cho frontend.
 *
 * Giải thích các trường:
 * - id        : mã câu hỏi
 * - content   : nội dung câu hỏi (text)
 * - answer    : đáp án đúng (có thể là text hoặc chuỗi mã hóa, tuỳ BE)
 * - point     : điểm của câu hỏi
 * - difficulty: độ khó (enum QuestionDifficulty)
 * - type      : loại câu hỏi (enum QuestionType)
 * - subjectId : thuộc môn nào
 * - chapter   : thuộc chương nào (dùng để phân loại)
 *
 * Lưu ý cho người mới:
 * - Nếu “answer” là dạng nhiều đáp án (multi) thì backend có thể lưu theo kiểu:
 *   "A|C" hoặc "1|3" hoặc JSON "[1,3]"...
 * - FE cần thống nhất format với BE để xử lý đúng.
 */
export interface Question {
  id: number;
  content: string;
  answer: string;
  point: number;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  subjectId: number;
  chapter: number;
}

/**
 * CreateQuestionDto:
 * - “DTO” = Data Transfer Object = gói dữ liệu FE gửi lên khi tạo câu hỏi.
 *
 * Các trường gần giống Question nhưng không có id (vì tạo mới thì server tự sinh id).
 *
 * chapter? optional:
 * - Dấu ? nghĩa là có thể không gửi chapter.
 * - Nếu backend cho phép bỏ trống chương thì FE có thể không truyền.
 */
export interface CreateQuestionDto {
  content: string;
  answer: string;
  point: number;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  subjectId: number;
  chapter?: number;
}

/**
 * UpdateQuestionDto:
 * - DTO FE gửi lên khi sửa câu hỏi.
 *
 * Khác CreateQuestionDto:
 * - Có thêm id để backend biết bạn đang sửa câu nào.
 */
export interface UpdateQuestionDto {
  id: number;
  content: string;
  answer: string;
  point: number;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  subjectId: number;
  chapter?: number;
}

/**
 * questionService:
 * - Object chứa các hàm gọi API.
 *
 * Lưu ý về Promise:
 * - Các hàm đều async => trả Promise.
 * - Khi dùng phải await:
 *   const questions = await questionService.getAllQuestions();
 */
export const questionService = {
  /**
   * getAllQuestions():
   * - Lấy danh sách tất cả câu hỏi.
   * - GET /api/Question/get-all
   * - Trả về Question[]
   */
  getAllQuestions: async (): Promise<Question[]> => {
    return (await apiClient.get<Question[]>(
      '/api/Question/get-all'
    )) as unknown as Promise<Question[]>;
  },

  /**
   * getQuestionById(id):
   * - Lấy 1 câu hỏi theo id.
   * - GET /api/Question/{id}
   */
  getQuestionById: async (id: number): Promise<Question> => {
    return (await apiClient.get<Question>(
      `/api/Question/${id}`
    )) as unknown as Promise<Question>;
  },

  /**
   * createQuestion(data):
   * - Tạo câu hỏi mới.
   * - POST /api/Question/create-question
   *
   * Trả về void:
   * - Nghĩa là FE chỉ cần biết “thành công hay lỗi”.
   * - Nếu backend có trả về câu hỏi vừa tạo, bạn nên đổi Promise<Question>.
   */
  createQuestion: async (data: CreateQuestionDto): Promise<void> => {
    return (await apiClient.post<void>(
      '/api/Question/create-question',
      data
    )) as unknown as Promise<void>;
  },

  /**
   * updateQuestion(data):
   * - Cập nhật câu hỏi.
   * - PUT /api/Question/update-question
   */
  updateQuestion: async (data: UpdateQuestionDto): Promise<void> => {
    return (await apiClient.put<void>(
      '/api/Question/update-question',
      data
    )) as unknown as Promise<void>;
  },

  /**
   * deleteQuestion(id):
   * - Xóa câu hỏi theo id.
   * - DELETE /api/Question/{id}
   */
  deleteQuestion: async (id: number): Promise<void> => {
    return (await apiClient.delete<void>(
      `/api/Question/${id}`
    )) as unknown as Promise<void>;
  },

  /**
   * importQuestions(file):
   * - Import câu hỏi bằng cách upload file lên server.
   *
   * Khái niệm FormData là gì?
   * - FormData là “gói dữ liệu kiểu form” để gửi file/binary qua HTTP.
   * - Khi upload file, ta không gửi JSON bình thường mà gửi theo multipart/form-data.
   *
   * Quy trình:
   * 1) Tạo formData
   * 2) Append file vào formData với key là 'file'
   *    (key 'file' phải đúng với backend yêu cầu, ví dụ [FromForm] IFormFile file)
   * 3) POST lên endpoint import
   *
   * Header 'Content-Type': 'multipart/form-data':
   * - Một số trường hợp axios tự set được.
   * - Nhưng set thủ công như bạn đang làm cũng được (miễn backend nhận đúng).
   */
  importQuestions: async (file: File): Promise<void> => {
    const formData = new FormData();

    // 'file' là tên field server sẽ đọc (phải đúng naming phía backend)
    formData.append('file', file);

    return (await apiClient.post<void>(
      '/api/Question/import-question',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )) as unknown as Promise<void>;
  }
};
