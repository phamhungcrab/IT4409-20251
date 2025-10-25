/**
 * ResultsPage component.
 *
 * Presents a table of exam results for the logged-in student (or all
 * students if accessed by an instructor).  It leverages the
 * `ResultTable` component for rendering a standardized list of results.
 * In a real application, data would be retrieved from an API based on
 * the current user's identity and permissions.  This stub uses
 * static sample data to illustrate the layout and integration with
 * existing components.
 */

import React, { useEffect, useState } from 'react';
import ResultTable, { ResultItem } from '../components/ResultTable';

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);

  useEffect(() => {
    // Populate with some example results.  Replace this with a call to
    // your results API.  Each entry includes the exam title and scoring.
    setResults([
      {
        id: 401,
        examTitle: 'Mathematics Midterm',
        objectiveScore: 7.5,
        subjectiveScore: 8.0,
        totalScore: 15.5,
        status: 'Completed',
      },
      {
        id: 402,
        examTitle: 'History Quiz',
        objectiveScore: 9.0,
        subjectiveScore: 0.0,
        totalScore: 9.0,
        status: 'Completed',
      },
    ]);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Exam Results</h1>
      <p className="text-gray-600">Here are your most recent examination results.</p>
      <ResultTable results={results} />
    </div>
  );
};

export default ResultsPage;