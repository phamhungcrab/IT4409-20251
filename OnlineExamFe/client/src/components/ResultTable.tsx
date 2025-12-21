/**
 * ResultTable: Component hiển thị bảng kết quả bài thi.
 *
 * Mục tiêu:
 * - Nhận vào danh sách kết quả `results` từ component cha (ví dụ ResultsPage).
 * - Render ra bảng (table) gồm các cột:
 *   + Tên bài thi (Exam)
 *   + Điểm (Score)
 *   + Trạng thái (Status)
 *   + Thời gian nộp (Submitted)
 *
 * Điểm đặc biệt:
 * - Tên bài thi được bọc bằng <Link> để click vào xem chi tiết:
 *   /results/:examId
 * - Đồng thời truyền kèm dữ liệu `state={{ result }}` để trang chi tiết có thể
 *   “hydrate” nhanh (hiển thị tạm thông tin ngay) trước khi gọi API lấy chi tiết.
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ResultItem mô tả 1 “dòng” dữ liệu kết quả.
 * Đây là dữ liệu mà backend trả về hoặc frontend tự map ra.
 */
export interface ResultItem {
  examId: number;         // ID bài thi (dùng làm key + dùng để tạo đường dẫn)
  examTitle: string;      // Tên bài thi hiển thị
  score: number;          // Điểm (số)
  status: string;         // Trạng thái (Completed, InProgress,...)
  submittedAt?: string;   // Có thể không có (optional). Nếu có thì là chuỗi ngày ISO
}

/**
 * Props của ResultTable:
 * - Component cha truyền `results` vào để ResultTable render.
 */
export interface ResultTableProps {
  results: ResultItem[];
}

const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl">
      {/* Bọc thêm overflow-x-auto để bảng không bị tràn trên màn hình nhỏ */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* THEAD: phần tiêu đề cột */}
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold">Exam</th>
              <th className="px-6 py-3 text-center text-xs font-semibold">Score</th>
              <th className="px-6 py-3 text-left text-xs font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold">Submitted</th>
            </tr>
          </thead>

          {/* TBODY: phần dữ liệu từng dòng */}
          <tbody className="divide-y divide-white/5">
            {/* Duyệt mảng results để tạo nhiều <tr> */}
            {results.map((result) => (
              <tr key={result.examId} className="hover:bg-white/5 transition">
                {/* Cột 1: Tên bài thi (click để xem chi tiết) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    // Tạo route chi tiết theo examId
                    to={`/results/${result.examId}`}
                    /**
                     * state={{ result }}:
                     * - Truyền dữ liệu sang trang chi tiết qua router state
                     * - Trang chi tiết có thể hiển thị tạm (optimistic UI) trước khi fetch API
                     */
                    state={{ result }}
                    className="text-sky-200 hover:text-white font-semibold"
                  >
                    {result.examTitle}
                  </Link>
                </td>

                {/* Cột 2: Điểm. toFixed(2) để hiển thị 2 chữ số thập phân */}
                <td className="px-6 py-4 text-center whitespace-nowrap font-semibold text-white">
                  {result.score.toFixed(2)}
                </td>

                {/* Cột 3: Trạng thái. Dùng UI dạng tag */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="tag">
                    {/* chấm xanh trang trí */}
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    {result.status}
                  </span>
                </td>

                {/* Cột 4: Thời gian nộp */}
                <td className="px-6 py-4 whitespace-nowrap text-slate-200">
                  {/*
                    submittedAt là optional (có thể undefined).
                    Nếu có thì chuyển sang Date để hiển thị dạng dễ đọc.
                    Nếu không có thì hiển thị '--'.
                  */}
                  {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : '--'}
                </td>
              </tr>
            ))}

            {/* Nếu không có kết quả thì render 1 dòng placeholder */}
            {results.length === 0 && (
              <tr>
                {/**
                 * colSpan: số cột mà ô này “chiếm”.
                 * Bảng đang có 4 cột, nên hợp lý là colSpan={4}.
                 * (Code cũ để 5 cũng không quá nguy hiểm, nhưng sai logic.)
                 */}
                <td colSpan={4} className="px-6 py-4 text-center text-slate-300">
                  Chưa có kết quả nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;


