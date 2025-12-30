/**
 * resultService (dịch vụ kết quả thi):
 *
 * File này gom các hàm gọi API liên quan đến “kết quả bài thi”:
 * - Lấy danh sách kết quả của 1 sinh viên (để hiển thị bảng kết quả)
 * - Lấy chi tiết kết quả của 1 bài thi (để hiển thị trang detail)
 *
 * Vì sao cần service?
 * - Component UI chỉ cần gọi hàm (getResultsByStudent, getResultDetail)
 * - Không phải viết axios/URL lặp lại ở nhiều chỗ
 */

import apiClient from '../utils/apiClient';

/**
 * Lưu ý quan trọng về kiến trúc:
 * - Bạn đang import ResultItem từ component ResultTable.
 * - Về lâu dài nên tách type ResultItem ra folder types/ (VD: src/types/result.ts)
 *   để tránh “component UI” phụ thuộc ngược vào “service”.
 *
 * Tuy nhiên hiện tại code vẫn chạy được, chỉ là không lý tưởng.
 */
import { ResultItem } from '../components/ResultTable';

// Export lại ResultItem để file khác import từ resultService cũng được
export type { ResultItem };

export const resultService = {
    /**
     * getResultsByStudent(studentId):
     *
     * Mục tiêu:
     * - Gọi API lấy danh sách kết quả theo sinh viên.
     * - Dữ liệu backend trả về có thể không thống nhất key (camelCase / PascalCase),
     *   nên ta “map/chuẩn hóa” về format ResultItem mà UI cần.
     *
     * Endpoint:
     * - GET /api/Result/student/{studentId}
     *
     * Vì sao phải try/catch?
     * - Nếu backend chưa có endpoint hoặc lỗi mạng, ta trả [] để UI không bị crash.
     * - UI sẽ hiển thị “không có kết quả” thay vì vỡ trang.
     */
    getResultsByStudent: async (studentId: number): Promise<ResultItem[]> => {
        try {
            /**
             * raw:
             * - Dữ liệu thô (chưa chuẩn hóa) server trả về.
             * - Dùng any[] vì chưa chắc format chính xác.
             */
            const raw = (await apiClient.get<any[]>(`/api/Result/student/${studentId}`)) as unknown as any[];

            /**
             * (raw || []):
             * - Nếu raw là null/undefined => dùng mảng rỗng []
             * - Tránh lỗi .map() trên undefined
             */
            return (raw || []).map((r: any) => ({
                /**
                 * examId:
                 * - Backend có thể trả:
                 *   r.examId (camelCase - hay gặp trong Node/JS)
                 *   r.ExamId (PascalCase - hay gặp trong C#)
                 *   r.id / r.Id (một số API đặt tên id chung)
                 *
                 * Toán tử ?? (nullish coalescing):
                 * - Lấy giá trị bên trái nếu nó KHÔNG phải null/undefined
                 * - Nếu là null/undefined thì lấy giá trị bên phải
                 * - Khác với || ở chỗ: 0 vẫn được coi là hợp lệ (|| thì sẽ coi 0 là false)
                 */
                examId: r.examId ?? r.ExamId ?? r.id ?? r.Id,

                /**
                 * examTitle:
                 * - Ưu tiên lấy examName / ExamName
                 * - Nếu không có thì tạo chuỗi dự phòng: "Exam <id>"
                 */
                examTitle: r.examName ?? r.ExamName ?? `Exam ${r.examId ?? r.Id ?? ''}`,

                /**
                 * score:
                 * - Ép về number để UI hiển thị và tính toán được
                 * - Nếu backend trả null/undefined thì mặc định 0
                 */
                score: Number(r.score ?? r.Score ?? 0),

                /**
                 * status:
                 * - Trạng thái kết quả (VD: completed/in_progress…)
                 * - Nếu không có thì để chuỗi rỗng
                 */
                status: r.status ?? r.Status ?? '',

                /**
                 * submittedAt:
                 * - Thời điểm nộp bài (string hoặc ISO string)
                 * - Không ép kiểu ở đây, UI sẽ format bằng new Date(...)
                 */
                submittedAt: r.submittedAt ?? r.SubmittedAt
            })) as ResultItem[];
        } catch (e: any) {
            /**
             * Nếu backend chưa có endpoint hoặc lỗi:
             * - Không làm UI crash
             * - Trả về danh sách rỗng để UI hiển thị “không có dữ liệu”
             *
             * console.warn:
             * - Dùng warn để dev thấy cảnh báo nhưng không làm ứng dụng chết.
             */
            console.warn('Endpoint kết quả chưa sẵn sàng, trả về danh sách rỗng.', e?.message || e);
            return [];
        }
    },

    /**
     * getResultDetail(studentId, examId):
     *
     * Mục tiêu:
     * - Lấy chi tiết kết quả của 1 bài thi, bao gồm:
     *   + thông tin tổng quan (điểm, số câu đúng, thời gian...)
     *   + danh sách từng câu hỏi (đáp án bạn chọn, đáp án đúng...)
     *
     * Endpoint:
     * - GET /api/Result/detail?studentId=...&examId=...
     *
     * Hiện tại return any:
     * - Vì bạn chưa định nghĩa interface ResultDetail rõ ràng trong service.
     * - Nên về lâu dài hãy tạo type ResultDetail để TypeScript kiểm tra chặt.
     */
    getResultDetail: async (studentId: number, examId: number): Promise<any> => {
        return (await apiClient.get<any>(
            `/api/Result/detail?studentId=${studentId}&examId=${examId}`
        )) as unknown as Promise<any>;
    }
};