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
// Hủy bỏ hàm unwrap cũ vì apiClient đã tự xử lý bóc tách dữ liệu
// const unwrap = <T>(res: any): T => { ... }

export const classService = {
    /**
     * getAll():
     * - Gọi API lấy tất cả lớp.
     * - Trả về mảng ClassDto[]
     */
    getAll: async (): Promise<ClassDto[]> => {
        // apiClient đã tự unwrap, nên chỉ cần cast kiểu hoặc truyền generic
        return await apiClient.get<ClassDto[]>('/api/CLass/get-all') as unknown as ClassDto[];
    },

    /**
     * getByTeacherAndSubject(teacherId, subjectId?):
     * - Lấy danh sách lớp theo giáo viên (teacherId)
     */
    getByTeacherAndSubject: async (teacherId: number, subjectId?: number): Promise<ClassDto[]> => {
        const url = subjectId
            ? `/api/CLass/get-by-teacher-and-subject?teacherId=${teacherId}&subjectId=${subjectId}`
            : `/api/CLass/get-by-teacher-and-subject?teacherId=${teacherId}`;

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
     * getStudentsByClass(classId):
     * - Lấy danh sách sinh viên thuộc một lớp
     */
    getStudentsByClass: async (classId: number): Promise<any[]> => {
        return await apiClient.get<any[]>(`/api/CLass/get-students?classId=${classId}`) as unknown as any[];
    }
};