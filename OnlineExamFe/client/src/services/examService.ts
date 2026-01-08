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
import { ExamDto, ExamGenerateResultDto, StudentExamDto } from '../types/exam';

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
   */
  createExam: async (data: CreateExamForTeacherOrAdmin): Promise<ExamDto> => {
    return await apiClient.post<ExamDto>('/api/Exam/create-exam', data);
  },

  /**
   * startExam(data):
   * - Sinh viên bấm “Start exam”.
   * - Gọi POST /api/Exam/start-exam
   *
   * Trả về ExamStartResponse:
   * - status, wsUrl, data...
   */
  startExam: async (data: ExamStartRequest): Promise<ExamStartResponse> => {
    return await apiClient.post<ExamStartResponse>('/api/Exam/start-exam', data);
  },

  /**
   * generateExam(data):
   * - Gọi POST /api/Exam/generate để tạo đề cho sinh viên (nếu backend tách bước).
   * - Trả về ExamGenerateResponse (message + exam payload).
   */
  generateExam: async (data: CreateExamForStudentDto): Promise<ExamGenerateResponse> => {
    return await apiClient.post<ExamGenerateResponse>('/api/Exam/generate', data);
  },

  /**
   * getStudentExams(studentId):
   * - Lấy danh sách bài thi mà sinh viên được giao.
   * - Gọi GET /api/Exam/get-by-student?studentId=...
   */
  getStudentExams: async (studentId: number): Promise<StudentExamDto[]> => {
    return await apiClient.get<StudentExamDto[]>(`/api/Exam/student/${studentId}/exams`);
  },

  /**
   * getAllExams():
   * - Lấy toàn bộ bài thi trong hệ thống (thường dành cho admin/teacher).
   * - Gọi GET /api/Exam/get-all
   */
  getAllExams: async (): Promise<ExamDto[]> => {
    return await apiClient.get<ExamDto[]>('/api/Exam/get-all');
  },

  /**
   * getCurrentQuestion(examId, studentId):
   * - Lấy lại đề thi đang làm dở (khi status = in_progress).
   * - Dùng khi: đổi máy thi, refresh mà mất localStorage.
   * - Gọi GET /api/Exam/exams/{examId}/current-question?studentId={studentId}
   */
  getCurrentQuestion: async (examId: number, studentId: number): Promise<ExamGenerateResultDto> => {
    return await apiClient.get<ExamGenerateResultDto>(
      `/api/Exam/exams/${examId}/current-question?studentId=${studentId}`
    );
  },

  /**
   * getExamStudentsStatus(examId):
   * - Lấy trạng thái làm bài và điểm của tất cả sinh viên trong kỳ thi
   * - Gọi GET /api/Exam/{examId}/students-status
   */
  getExamStudentsStatus: async (examId: number): Promise<ExamStudentsStatusResponse> => {
    return await apiClient.get<ExamStudentsStatusResponse>(
      `/api/Exam/${examId}/students-status`
    );
  },

  /**
   * deleteExam(examId):
   * - Xóa kỳ thi theo ID
   * - Gọi DELETE /api/Exam/delete/{id}
   * - Chỉ teacher/admin có quyền xóa exam thuộc lớp của mình
   */
  deleteExam: async (examId: number): Promise<void> => {
    return await apiClient.delete<void>(`/api/Exam/delete/${examId}`);
  },

  updateExam: async (id: number, data: CreateExamForTeacherOrAdmin): Promise<any> => {
    return await apiClient.put(`/api/Exam/update/${id}`, data);
  },

  /**
   * recordViolation(data):
   * - Records an exam integrity violation (tab switch, fullscreen exit, etc.).
   * - Implements offline queue: if API fails, stores in localStorage and retries later.
   * - Called by useExamIntegrity hook when a violation is detected.
   */
  recordViolation: async (data: RecordViolationDto): Promise<void> => {
    const OFFLINE_QUEUE_KEY = 'pending_violations';

    // Helper: Load pending violations from localStorage
    const loadPendingViolations = (): RecordViolationDto[] => {
      try {
        const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    };

    // Helper: Save pending violations to localStorage
    const savePendingViolations = (queue: RecordViolationDto[]) => {
      try {
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      } catch (e) {
        console.error('[ViolationService] Failed to save pending violations:', e);
      }
    };

    // Helper: Send a single violation
    const sendViolation = async (violation: RecordViolationDto): Promise<boolean> => {
      try {
        await apiClient.post('/api/Exam/violation', violation);
        return true;
      } catch (error) {
        console.warn('[ViolationService] Failed to send violation:', error);
        return false;
      }
    };

    // Try to send the current violation
    const success = await sendViolation(data);

    if (!success) {
      // Queue for later
      console.log('[ViolationService] Queueing violation for later retry...');
      const queue = loadPendingViolations();
      queue.push(data);
      savePendingViolations(queue);
    } else {
      // Also try to flush any pending violations
      const pendingQueue = loadPendingViolations();
      if (pendingQueue.length > 0) {
        console.log(`[ViolationService] Flushing ${pendingQueue.length} pending violations...`);
        const successfullyFlushed: number[] = [];

        for (let i = 0; i < pendingQueue.length; i++) {
          const sent = await sendViolation(pendingQueue[i]);
          if (sent) {
            successfullyFlushed.push(i);
          } else {
            // Stop on first failure to preserve order
            break;
          }
        }

        // Remove successfully sent items
        const remaining = pendingQueue.filter((_, idx) => !successfullyFlushed.includes(idx));
        savePendingViolations(remaining);

        if (successfullyFlushed.length > 0) {
          console.log(`[ViolationService] Successfully flushed ${successfullyFlushed.length} pending violations.`);
        }
      }
    }
  }
};

/**
 * RecordViolationDto:
 * - Data to send when recording a violation.
 */
export interface RecordViolationDto {
  examId: number;
  studentId: number;
  violationType: 'FOCUS_LOSS' | 'FULLSCREEN_EXIT';
  occurredAt: string; // ISO timestamp
  durationMs?: number;
}

/**
 * ExamStudentsStatusResponse:
 * - Response từ API /api/Exam/{examId}/students-status
 */
export interface ExamStudentsStatusResponse {
  examId: number;
  examName: string;
  students: ExamStudentStatus[];
}

export interface ExamStudentStatus {
  studentId: number;
  studentName: string;
  mssv: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | null;
  score: number | null;
  submittedAt: string | null;
}
