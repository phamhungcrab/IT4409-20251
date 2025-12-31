/**
 * ResultTable: Component hiển thị bảng kết quả bài thi.
 *
 * Mục tiêu:
 * - Nhận vào danh sách kết quả `results` từ component cha (ví dụ ResultsPage).
 * - Render ra bảng (table) gồm các cột:
 *   + Tên bài thi (Exam)
 *   + Điểm (Score)
 *   + Số câu đúng
 *   + Thời gian nộp (Submitted)
 *
 * Điểm đặc biệt:
 * - Tên bài thi được bọc bằng <Link> để click vào xem chi tiết:
 *   /results/:examId
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ResultItem mô tả 1 "dòng" dữ liệu kết quả.
 */
export interface ResultItem {
  examId: number;         // ID bài thi
  examTitle: string;      // Tên bài thi hiển thị
  score: number;          // Điểm (số)
  status: string;         // Trạng thái (completed, in_progress,...)
  submittedAt?: string;   // Thời gian nộp
  correctCount?: number;  // Số câu đúng
  totalQuestions?: number; // Tổng số câu
}

/**
 * Props của ResultTable
 */
export interface ResultTableProps {
  results: ResultItem[];
}

const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* THEAD: phần tiêu đề cột */}
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                Bài thi
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-300">
                Điểm
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-300">
                Số câu đúng
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                Thời gian nộp
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-300">
                Chi tiết
              </th>
            </tr>
          </thead>

          {/* TBODY: phần dữ liệu từng dòng */}
          <tbody className="divide-y divide-white/5">
            {results.map((result) => (
              <tr key={result.examId} className="hover:bg-white/5 transition">
                {/* Cột 1: Tên bài thi */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-white font-semibold">
                    {result.examTitle}
                  </span>
                </td>

                {/* Cột 2: Điểm */}
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center rounded-lg bg-sky-500/20 px-3 py-1 text-lg font-bold text-sky-300">
                    {result.score.toFixed(1)}
                  </span>
                </td>

                {/* Cột 3: Số câu đúng */}
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <span className="text-emerald-400 font-semibold">
                    {result.correctCount ?? '--'}
                  </span>
                  <span className="text-slate-400">
                    /{result.totalQuestions ?? '--'}
                  </span>
                </td>

                {/* Cột 4: Thời gian nộp */}
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                  {result.submittedAt
                    ? new Date(result.submittedAt).toLocaleString('vi-VN')
                    : '--'}
                </td>

                {/* Cột 5: Nút xem chi tiết */}
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <Link
                    to={`/results/${result.examId}`}
                    state={{ result }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Xem
                  </Link>
                </td>
              </tr>
            ))}

            {/* Nếu không có kết quả */}
            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-12 h-12 text-slate-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                      />
                    </svg>
                    <p className="text-slate-400">Chưa có kết quả bài thi nào.</p>
                    <p className="text-sm text-slate-500">Hoàn thành bài thi để xem kết quả tại đây.</p>
                  </div>
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
