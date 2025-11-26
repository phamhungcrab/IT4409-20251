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
  id: number;
  examTitle: string;
  objectiveScore: number;
  subjectiveScore: number;
  totalScore: number;
  status: string;
}

export interface ResultTableProps {
  results: ResultItem[];
}

const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300 border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Exam</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Objective</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Subjective</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Total</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results.map((result) => (
            <tr key={result.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">
                <Link to={`/results/${result.id}`} className="text-blue-600 hover:underline">
                  {result.examTitle}
                </Link>
              </td>
              <td className="px-4 py-2 text-center whitespace-nowrap">
                {result.objectiveScore.toFixed(2)}
              </td>
              <td className="px-4 py-2 text-center whitespace-nowrap">
                {result.subjectiveScore.toFixed(2)}
              </td>
              <td className="px-4 py-2 text-center whitespace-nowrap font-semibold">
                {result.totalScore.toFixed(2)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{result.status}</td>
            </tr>
          ))}
          {results.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                No results available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;