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

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatLocalDateTime } from '../utils/dateUtils';

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
  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // State cho sắp xếp
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ResultItem | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Xử lý logic Filter & Sort
  const processedResults = useMemo(() => {
    // 1. Filter theo tên bài thi
    let items = [...results];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      items = items.filter((r) => r.examTitle.toLowerCase().includes(lower));
    }

    // 2. Sort
    if (sortConfig.key) {
      items.sort((a, b) => {
        const aValue = a[sortConfig.key!] ?? '';
        const bValue = b[sortConfig.key!] ?? '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return items;
  }, [results, searchTerm, sortConfig]);

  // Hàm xử lý khi click vào header
  const handleSort = (key: keyof ResultItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper render icon sort
  const SortIcon = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => {
    if (!active) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1 text-sky-400">{direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white/5 p-3 rounded-xl border border-white/10">
        <div className="relative w-full sm:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder="Tìm kiếm bài thi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-400 sm:text-right">
          Hiển thị {processedResults.length} kết quả
        </div>
      </div>

      <div className="space-y-3 sm:hidden">
        {processedResults.map((result) => (
          <div key={result.examId} className="glass-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">BÀI THI</p>
                <h3 className="text-base font-semibold text-white break-words line-clamp-2">{result.examTitle}</h3>
              </div>
              <div className="shrink-0 rounded-lg bg-sky-500/20 px-2.5 py-1 text-sm font-bold text-sky-300">
                {result.score.toFixed(1)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">SỐ CÂU ĐÚNG</p>
                <p className="font-semibold text-emerald-400">
                  {result.correctCount ?? '--'}
                  <span className="text-slate-400">/{result.totalQuestions ?? '--'}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">THỜI GIAN NỘP</p>
                <p className="text-slate-200">
                  {result.submittedAt ? formatLocalDateTime(result.submittedAt) : '--'}
                </p>
              </div>
            </div>

            <Link
              to={`/results/${result.examId}`}
              state={{ result }}
              className="btn btn-ghost w-full justify-center text-sm"
            >
              Xem chi tiết
            </Link>
          </div>
        ))}

        {processedResults.length === 0 && (
          <div className="glass-card px-6 py-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-slate-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-slate-400">
                {searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : 'Chưa có kết quả bài thi nào.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="hidden sm:block">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full">
            {/* THEAD: phần tiêu đề cột */}
            <thead>
              <tr className="bg-white/5">
                <th
                  onClick={() => handleSort('examTitle')}
                  className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300 cursor-pointer hover:text-white select-none transition-colors group"
                >
                  <div className="flex items-center">
                    Bài thi
                    <SortIcon active={sortConfig.key === 'examTitle'} direction={sortConfig.direction} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('score')}
                  className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-300 cursor-pointer hover:text-white select-none transition-colors"
                >
                  <div className="flex items-center justify-center">
                    Điểm
                    <SortIcon active={sortConfig.key === 'score'} direction={sortConfig.direction} />
                  </div>
                </th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Số câu đúng
                </th>
                <th
                  onClick={() => handleSort('submittedAt')}
                  className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-300 cursor-pointer hover:text-white select-none transition-colors"
                >
                  <div className="flex items-center">
                    Thời gian nộp
                    <SortIcon active={sortConfig.key === 'submittedAt'} direction={sortConfig.direction} />
                  </div>
                </th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Chi tiết
                </th>
              </tr>
            </thead>

            {/* TBODY: phần dữ liệu từng dòng */}
            <tbody className="divide-y divide-white/5">
              {processedResults.map((result) => (
                <tr key={result.examId} className="hover:bg-white/5 transition">
                  {/* Cột 1: Tên bài thi */}
                  <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <span className="text-white font-semibold">
                      {result.examTitle}
                    </span>
                  </td>

                  {/* Cột 2: Điểm */}
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center justify-center rounded-lg bg-sky-500/20 px-3 py-1 text-lg font-bold text-sky-300">
                      {result.score.toFixed(1)}
                    </span>
                  </td>

                  {/* Cột 3: Số câu đúng */}
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
                    <span className="text-emerald-400 font-semibold">
                      {result.correctCount ?? '--'}
                    </span>
                    <span className="text-slate-400">
                      /{result.totalQuestions ?? '--'}
                    </span>
                  </td>

                  {/* Cột 4: Thời gian nộp */}
                  <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-slate-300">
                    {result.submittedAt
                      ? formatLocalDateTime(result.submittedAt)
                      : '--'}
                  </td>

                  {/* Cột 5: Nút xem chi tiết */}
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
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
              {processedResults.length === 0 && (
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <p className="text-slate-400">
                        {searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : 'Chưa có kết quả bài thi nào.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultTable;
