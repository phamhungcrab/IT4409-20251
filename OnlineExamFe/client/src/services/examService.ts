/**
 * examService (dịch vụ bài thi):
 *
 * File này gom các hàm gọi API liên quan đến:
 * - Tạo bài thi (giáo viên/admin)
 * - Bắt đầu làm bài thi (sinh viên)
 * - Sinh đề/Generate đề (nếu hệ thống tách bước generate)
 * - Lấy danh sách bài thi theo sinh viên
 * - Lấy tất cả bài thi (admin/teacher)
 *
 * Vì sao nên tách service?
 * - Để component không phải viết axios/fetch lặp lại.
 * - Dễ sửa endpoint / logic request ở 1 chỗ.
 */

import apiClient from '../utils/apiClient';
import { ExamDto, ExamGenerateResultDto } from '../types/exam';

/**
 * CreateExamForTeacherOrAdmin:
 * - Dữ liệu gửi lên khi giáo viên/admin tạo bài thi mới.
 *
 * Giải thích các trường:
 * - name            : tên bài thi (VD: "Giữa kỳ CSDL")
 * - classId         : bài thi thuộc lớp nào
 * - blueprintId     : id “mẫu đề/khung đề” (hệ thống dùng để tạo câu hỏi)
 * - durationMinutes : thời lượng làm bài (phút)
 * - startTime/endTime:
 *    + dạng chuỗi ISO (thường là thời điểm mở/đóng bài thi)
 *    + ISO string là dạng chuẩn lưu thời gian, ví dụ: "2025-12-19T10:00:00Z"
 *
 * Lưu ý người mới:
 * - startTime/endTime thường do UI dùng input datetime-local sinh ra (chuỗi),
 *   rồi gửi lên server.
 */
export interface CreateExamForTeacherOrAdmin {
  name: string;
  classId: number;
  blueprintId: number;
  durationMinutes: number;
  startTime: string; // Chuỗi thời gian chuẩn (ISO)
  endTime: string;   // Chuỗi thời gian chuẩn (ISO)
}

/**
 * ExamStartRequest:
 * - Dữ liệu gửi lên khi sinh viên bấm “Start exam”.
 *
 * - examId    : ID bài thi
 * - studentId : ID sinh viên
 */
export interface ExamStartRequest {
  examId: number;
  studentId: number;
}

/**
 * CreateExamForStudentDto:
 * - Một số hệ thống tách riêng bước “generate đề cho từng sinh viên” (đề cá nhân hóa).
 * - Dữ liệu gửi lên để server tạo đề/attempt theo sinh viên.
 *
 * - examId         : bài thi gốc
 * - studentId      : sinh viên làm bài
 * - durationMinutes: thời lượng (có thể override)
 * - startTime/endTime: thời gian làm bài áp dụng cho attempt (tuỳ hệ thống)
 */
export interface CreateExamForStudentDto {
  examId: number;
  studentId: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
}

/**
 * ExamStartResponse:
 * - Dữ liệu server trả về khi gọi start-exam.
 *
 * status: trạng thái attempt của sinh viên với bài thi này:
 * - 'create'      : tạo mới attempt, vào làm bài bình thường
 * - 'in_progress' : đang làm dở (có thể resume)
 * - 'completed'   : đã nộp rồi (không vào làm nữa)
 * - 'expired'     : hết hạn (quá endTime hoặc quá quy định)
 *
 * wsUrl (optional):
 * - URL WebSocket để đồng bộ realtime đáp án (nếu hệ thống dùng WS).
 *
 * data (optional):
 * - payload đề thi đã generate: gồm questions, durationMinutes...
 * - Có thể không có nếu server chỉ trả wsUrl + status và yêu cầu FE tự lấy từ cache.
 */
export interface ExamStartResponse {
  status: 'create' | 'in_progress' | 'completed' | 'expired';
  wsUrl?: string;
  data?: ExamGenerateResultDto;
}

/**
 * ExamGenerateResponse:
 * - Phản hồi khi gọi API generate đề (nếu có).
 *
 * - message: thông báo (VD: "Generated successfully")
 * - exam   : đề thi đã generate cho sinh viên (questions, duration...)
 */
export interface ExamGenerateResponse {
  message: string;
  exam: ExamGenerateResultDto;
}

/**
 * examService:
 * - Object chứa các hàm gọi API bài thi.
 *
 * Lưu ý quan trọng cho người mới:
 * - Các hàm này đều trả về Promise.
 * - Promise nghĩa là “kết quả sẽ có sau” (vì gọi mạng cần thời gian).
 * - Bạn sẽ gọi bằng async/await ở component:
 *    const data = await examService.getAllExams();
 */
export const examService = {
  /**
   * createExam(data):
   * - Dành cho teacher/admin tạo bài thi.
   * - Gọi POST /api/Exam/create-exam
   *
   * Trả về ExamDto (thông tin bài thi vừa tạo).
   *
   * Tại sao lại có `as unknown as Promise<ExamDto>`?
   * - Thường là do apiClient của bạn có interceptor “bóc dữ liệu”,
   *   làm TypeScript không suy luận đúng kiểu trả về.
   * - Ép kiểu giúp TS không báo lỗi, nhưng về lâu dài nên chuẩn hóa apiClient
   *   để khỏi phải ép kiểu ở mọi nơi.
   */
  createExam: async (data: CreateExamForTeacherOrAdmin): Promise<ExamDto> => {
    return (await apiClient.post<ExamDto>(
      '/api/Exam/create-exam',
      data
    )) as unknown as Promise<ExamDto>;
  },

  /**
   * startExam(data):
   * - Sinh viên bấm “Start exam”.
   * - Gọi POST /api/Exam/start-exam
   *
   * Trả về ExamStartResponse:
   * - status, wsUrl, data...
   *
   * FE dựa vào status để quyết định:
   * - create/in_progress => vào phòng thi
   * - completed => chuyển qua results
   * - expired => báo hết hạn
   */
  startExam: async (data: ExamStartRequest): Promise<ExamStartResponse> => {
    return (await apiClient.post<ExamStartResponse>(
      '/api/Exam/start-exam',
      data
    )) as unknown as Promise<ExamStartResponse>;
  },

  /**
   * generateExam(data):
   * - Gọi POST /api/Exam/generate để tạo đề cho sinh viên (nếu backend tách bước).
   * - Trả về ExamGenerateResponse (message + exam payload).
   */
  generateExam: async (data: CreateExamForStudentDto): Promise<ExamGenerateResponse> => {
    return (await apiClient.post<ExamGenerateResponse>(
      '/api/Exam/generate',
      data
    )) as unknown as Promise<ExamGenerateResponse>;
  },

  /**
   * getStudentExams(studentId):
   * - Lấy danh sách bài thi mà sinh viên được giao.
   * - Gọi GET /api/Exam/get-by-student?studentId=...
   *
   * Lưu ý người mới:
   * - Dùng query string (?studentId=) để truyền tham số lên server.
   *
   * Nhược điểm của code hiện tại:
   * - Bạn gọi apiClient.get<any[]> rồi cast sang ExamDto[]
   * - Nếu backend trả sai format, TS cũng không bắt được.
   *
   * Gợi ý:
   * - Tốt hơn là: apiClient.get<ExamDto[]>(url) và/hoặc dùng unwrap chuẩn.
   */
  getStudentExams: async (studentId: number): Promise<ExamDto[]> => {
    const res = await apiClient.get<any>(`/api/Exam/get-by-student?studentId=${studentId}`);

    // Ép kiểu để TypeScript hiểu là ExamDto[]
    // (thực tế: nếu res bị bọc {data: ...} thì cách này vẫn có thể sai)
    return res as unknown as Promise<ExamDto[]>;
  },

  /**
   * getAllExams():
   * - Lấy toàn bộ bài thi trong hệ thống (thường dành cho admin/teacher).
   * - Gọi GET /api/Exam/get-all
   */
  getAllExams: async (): Promise<ExamDto[]> => {
    return (await apiClient.get<ExamDto[]>(
      '/api/Exam/get-all'
    )) as unknown as Promise<ExamDto[]>;
  }
};
