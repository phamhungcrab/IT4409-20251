import apiClient from '../utils/apiClient';

/**
 * ClassDto:
 * - “Dto” = Data Transfer Object = gói dữ liệu trao đổi giữa FE và BE.
 * - Đây là kiểu dữ liệu “lớp học” mà backend trả về cho frontend.
 *
 * Giải thích các trường:
 * - id         : mã lớp (ID trong hệ thống)
 * - name       : tên lớp (VD: "IT3180 - Nhóm 08")
 * - teacherId  : ID giáo viên phụ trách lớp
 * - subjectId  : ID môn học
 *
 * Các trường optional (có thể có hoặc không, tuỳ backend trả):
 * - subjectName   : tên môn học
 * - teacherName   : tên giáo viên
 * - studentCount  : số lượng sinh viên trong lớp
 *
 * Lưu ý:
 * - Dấu ? nghĩa là “có thể không tồn tại”.
 * - Nếu backend không trả về field đó thì TypeScript vẫn không báo lỗi.
 */
export interface ClassDto {
  id: number;
  name: string;
  teacherId: number;
  subjectId: number;
  subjectName?: string;
  teacherName?: string;
  studentCount?: number;
}

/**
 * CreateClassDto:
 * - Kiểu dữ liệu frontend gửi lên khi tạo lớp mới.
 *
 * Giải thích:
 * - name      : tên lớp
 * - teacherId : ID giáo viên được gán vào lớp
 * - subjectId : ID môn học
 */
export interface CreateClassDto {
  name: string;
  teacherId: number;
  subjectId: number;
}

/**
 * unwrap<T>(res):
 *
 * Mục tiêu:
 * - Một số API (hoặc apiClient) có thể trả dữ liệu theo nhiều “kiểu vỏ bọc” khác nhau:
 *   1) Trả thẳng dữ liệu:           res = [ ... ]
 *   2) Trả theo chuẩn Axios:        res = { data: ... }
 *   3) Trả theo kiểu backend C#:    res = { Data: ... }   (PascalCase)
 *
 * => unwrap sẽ cố gắng “bóc” dữ liệu thật ra để FE dùng thống nhất.
 *
 * Giải thích khái niệm Generic <T>:
 * - <T> là “kiểu dữ liệu bạn mong muốn nhận được”.
 * - Ví dụ: unwrap<ClassDto[]>(res) nghĩa là “hãy trả cho tôi dữ liệu dạng ClassDto[]”.
 *
 * Lưu ý:
 * - res: any vì có thể là nhiều dạng khác nhau.
 * - unwrap chỉ là “hỗ trợ”, nếu backend trả format lạ hơn thì unwrap sẽ không bóc đúng.
 */
const unwrap = <T>(res: any): T => {
  // Nếu res là object (không phải null) thì kiểm tra xem có field data hoặc Data không
  if (res && typeof res === 'object') {
    // Trường hợp axios response: { data: ... }
    if ('data' in res) return res.data as T;

    // Trường hợp backend bọc dữ liệu theo PascalCase: { Data: ... }
    if ('Data' in res) return (res as any).Data as T;
  }

  // Nếu không có lớp bọc nào, coi như res chính là dữ liệu thật
  return res as T;
};

/**
 * classService:
 * - Gom các hàm gọi API liên quan tới “lớp học”.
 *
 * Vì sao nên tách service?
 * - Tránh lặp code gọi API trong component.
 * - Dễ bảo trì: đổi endpoint/chỉnh request chỉ sửa ở một nơi.
 */
export const classService = {
  /**
   * getAll():
   * - Gọi API lấy tất cả lớp.
   * - Trả về mảng ClassDto[]
   *
   * Endpoint bạn đang dùng: /api/CLass/get-all
   * Lưu ý:
   * - “CLass” viết hoa lạ (C + L) rất dễ sai chính tả so với “Class”.
   * - Nếu backend đúng là /api/CLass/... thì FE phải giữ y như vậy.
   */
  getAll: async (): Promise<ClassDto[]> => {
    // apiClient.get<any> vì res có thể bị bọc nhiều lớp
    const res = await apiClient.get<any>('/api/CLass/get-all');

    // bóc dữ liệu ra đúng kiểu ClassDto[]
    return unwrap<ClassDto[]>(res);
  },

  /**
   * getByTeacherAndSubject(teacherId, subjectId?):
   *
   * - Lấy danh sách lớp theo giáo viên (teacherId)
   * - Nếu có subjectId thì lọc thêm theo môn học
   *
   * Cách bạn làm:
   * - Tự ghép query string vào URL:
   *   /api/CLass/get-by-teacher-and-subject?teacherId=...&subjectId=...
   *
   * Lưu ý cho người mới:
   * - Dấu ? nghĩa là subjectId có thể truyền hoặc không truyền.
   */
  getByTeacherAndSubject: async (teacherId: number, subjectId?: number): Promise<ClassDto[]> => {
    // Nếu có subjectId thì gắn cả teacherId và subjectId lên query
    const url = subjectId
      ? `/api/CLass/get-by-teacher-and-subject?teacherId=${teacherId}&subjectId=${subjectId}`
      : `/api/CLass/get-by-teacher-and-subject?teacherId=${teacherId}`;

    const res = await apiClient.get<any>(url);
    return unwrap<ClassDto[]>(res);
  },

  /**
   * create(data):
   * - Tạo lớp mới
   * - data là CreateClassDto (name, teacherId, subjectId)
   *
   * Hiện bạn đang return Promise<any>.
   * Gợi ý:
   * - Nếu backend trả về lớp vừa tạo, nên đổi return type thành ClassDto.
   * - Nếu backend chỉ trả message, nên tạo kiểu ResponseDto rõ ràng.
   */
  create: async (data: CreateClassDto): Promise<any> => {
    const res = await apiClient.post<any>('/api/CLass/create', data);
    return unwrap<any>(res);
  },

  /**
   * getStudentsByClass(classId):
   * - Lấy danh sách sinh viên thuộc một lớp
   *
   * Hiện bạn đang return Promise<any[]> vì chưa định nghĩa StudentDto ở đây.
   * Gợi ý:
   * - Nên tạo interface StudentDto để TypeScript kiểm tra lỗi (đỡ bug).
   */
  getStudentsByClass: async (classId: number): Promise<any[]> => {
    const res = await apiClient.get<any>(`/api/CLass/get-students?classId=${classId}`);
    return unwrap<any[]>(res);
  }
};
