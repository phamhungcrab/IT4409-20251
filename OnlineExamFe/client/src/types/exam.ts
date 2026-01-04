/**
 * Các định nghĩa kiểu dữ liệu (types) dùng chung cho hệ thống thi online.
 *
 * Mục tiêu:
 * - Chuẩn hóa dữ liệu giữa các màn hình Student / Teacher / Admin.
 * - Tránh việc chỗ thì gọi "title", chỗ thì gọi "name".
 * - Tránh việc chỗ thì gọi "duration", chỗ thì gọi "durationMinutes".
 *
 * Lợi ích:
 * - TypeScript sẽ báo lỗi ngay nếu bạn dùng sai field.
 * - Dễ bảo trì khi backend thay đổi: chỉ cần cập nhật types một chỗ.
 */

/**
 * ExamDto:
 * - “DTO” (Data Transfer Object) = gói dữ liệu trao đổi giữa frontend và backend.
 * - Đây là dữ liệu “bài thi” cơ bản để hiển thị danh sách bài thi, dashboard, admin table...
 *
 * Giải thích trường:
 * - id             : mã bài thi
 * - name           : tên bài thi (đã chuẩn hóa, tránh "title" / "examTitle")
 * - durationMinutes: thời lượng làm bài (phút) (đã chuẩn hóa)
 * - startTime/endTime:
 *    + dạng string theo chuẩn ISO (khuyên dùng)
 *    + UI có thể new Date(startTime).toLocaleString() để hiển thị
 * - status?        : trạng thái hiển thị trên UI (có thể do BE trả hoặc FE tự tính)
 * - classId?       : bài thi thuộc lớp nào (nếu hệ thống có lớp)
 * - createBy?      : id giáo viên tạo (trường này tên hơi lạ, thường là createdBy)
 * - subjectId?     : môn học
 * - blueprintId?   : mẫu đề/khung đề dùng để generate câu hỏi
 *
 * Lưu ý:
 * - Dấu ? nghĩa là “có thể không có”.
 * - Khi optional thì UI phải xử lý trường hợp undefined.
 */
export interface ExamDto {
  id: number;
  name: string;
  durationMinutes: number;
  startTime: string; // Chuỗi thời gian chuẩn ISO
  endTime: string;   // Chuỗi thời gian chuẩn ISO
  status?: string;
  classId?: number;
  createBy?: number;
  subjectId?: number;
  blueprintId?: number;
}

/**
 * StudentExamDto:
 * - Dữ liệu bài thi trả về riêng cho sinh viên (từ endpoint /api/Exam/student/.../exams).
 * - Backend trả về các trường theo naming convention khác với ExamDto cơ bản.
 *
 * Các trường:
 * - examId         : mã bài thi
 * - examName       : tên bài thi
 * - startTime/endTime: thời gian
 * - durationMinutes: thời lượng
 * - status         : trạng thái (COMPLETED, null...)
 */
export interface StudentExamDto {
  examId: number;
  examName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status?: string | null;
}

/**
 * UpcomingExamDto:
 * - Một kiểu dữ liệu “phục vụ UI” (view model) cho danh sách bài sắp diễn ra.
 *
 * Điểm khác với ExamDto:
 * - startTime/endTime ở đây là Date (đối tượng Date của JavaScript), không phải string.
 *
 * Lưu ý cho người mới:
 * - Backend thường trả thời gian dạng string (ISO).
 * - Nếu bạn muốn dùng Date thì bạn phải tự convert:
 *   const dto: UpcomingExamDto = { ... , startTime: new Date(exam.startTime) }
 *
 * Tại sao phải cẩn thận?
 * - Nếu bạn lưu Date vào localStorage rồi đọc lại sẽ thành string (mất Date object).
 * - Nếu truyền qua JSON thì Date cũng thành string.
 */
export interface UpcomingExamDto {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
}

/**
 * GeneratedQuestionDto:
 * - Câu hỏi “đã generate” cho 1 lần thi (attempt).
 * - Đây thường là dữ liệu trả về khi startExam/generateExam để FE render phòng thi.
 *
 * Giải thích trường:
 * - id      : mã câu hỏi
 * - order   : thứ tự câu hỏi trong đề (rất quan trọng để hiển thị và sync)
 * - content : nội dung câu hỏi
 *
 * - cleanAnswer:
 *    + danh sách đáp án lựa chọn (thường là các option)
 *    + kiểu string[] nghĩa là mỗi phần tử là text của đáp án
 *
 * - correctOptionIds?:
 *    + danh sách id đáp án đúng (nếu backend trả sẵn)
 *    + optional vì có hệ thống không muốn FE biết đáp án đúng khi đang thi
 *
 * - type:
 *    + loại câu hỏi (số) (VD: 0/1/2... tùy backend enum)
 *    + FE thường map sang SINGLE/MULTI/TEXT tùy quy ước
 *
 * - difficulty: độ khó (số)
 * - point     : điểm câu hỏi
 * - chapter   : thuộc chương nào
 * - imageUrl? : link ảnh nếu câu hỏi có hình minh họa
 */
export interface GeneratedQuestionDto {
  id: number;
  order: number;
  content: string;
  cleanAnswer: string[];
  correctOptionIds?: number[];
  type: string; // Backend trả về string: "MULTIPLE_CHOICE" | "SINGLE_CHOICE"
  difficulty: string; // Backend trả về string: "Easy" | "Medium" | ...
  point: number;
  chapter: number;
  imageUrl?: string;
}

/**
 * ExamGenerateResultDto:
 * - Dữ liệu đề thi đã generate cho 1 bài thi / 1 attempt.
 * - Thường dùng trong:
 *   + startExam API trả về payload questions + duration
 *   + generateExam API trả về payload
 *
 * Giải thích trường:
 * - examId         : mã bài thi
 * - name           : tên bài thi
 * - totalQuestions : tổng số câu
 * - startTime/endTime: thời gian mở/đóng (ISO string)
 * - durationMinutes: thời lượng làm bài
 * - classId        : lớp áp dụng
 * - blueprintId?   : mẫu đề
 * - questions      : danh sách câu hỏi đã generate
 */
export interface ExamGenerateResultDto {
  examId: number;
  name: string;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  classId: number;
  blueprintId?: number;
  questions: GeneratedQuestionDto[];
}
