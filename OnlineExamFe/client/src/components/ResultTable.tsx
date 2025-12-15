/**
 * ResultTable component.
 *
 * Displays a table of exam results.  Each row shows the exam title, the
 * objective and subjective scores, the total score and status.  The
 * `ResultItem` interface describes the shape of the data.  When there
 * are no results, a placeholder row is shown.  Links can be added to
 * navigate to detailed result pages using React Router.
 */

import React from 'react';
import { Link } from 'react-router-dom';

export interface ResultItem {
  examId: number;
  examTitle: string;
  score: number;
  status: string;
  submittedAt?: string;
}

export interface ResultTableProps {
  results: ResultItem[];
}

const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold">Exam</th>
              <th className="px-6 py-3 text-center text-xs font-semibold">Score</th>
              <th className="px-6 py-3 text-left text-xs font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {results.map((result) => (
              <tr key={result.examId} className="hover:bg-white/5 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/results/${result.examId}`}
                    state={{ result }}
                    className="text-sky-200 hover:text-white font-semibold"
                  >
                    {result.examTitle}
                  </Link>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap font-semibold text-white">
                  {result.score.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="tag">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    {result.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-200">
                  {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : '--'}
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-slate-300">
                  No results available.
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
