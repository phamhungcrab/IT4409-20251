/**
 * ExamListPage component.
 *
 * Displays a list of exams that are available for the current user.  Each
 * exam shows its title, scheduled start and end time, and current status
 * (e.g. upcoming, in progress, or completed).  Users can click the "Start"
 * or "Continue" button to enter the exam room.  In a full implementation,
 * this page would fetch the list of exams from the backend API using a
 * hook or service (e.g. examService.listExams()) and handle pagination
 * or filtering.  Here, we use sample data to illustrate structure and
 * component interactions.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Define the shape of an exam item.  Additional fields (e.g. subject,
// description) can be added as needed.
interface ExamItem {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'in_progress' | 'completed';
}

const ExamListPage: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>([]);

  useEffect(() => {
    // Populate the list with sample exams.  Replace this with a call to
    // fetch data from your API.  Times are set relative to the current
    // time for demonstration purposes.
    const now = Date.now();
    setExams([
      {
        id: 301,
        title: 'Physics Quiz',
        startTime: new Date(now + 1 * 24 * 60 * 60 * 1000),
        endTime: new Date(now + 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: 'upcoming',
      },
      {
        id: 302,
        title: 'Chemistry Midterm',
        startTime: new Date(now - 30 * 60 * 1000), // started 30 min ago
        endTime: new Date(now + 60 * 60 * 1000),   // ends in 1 hour
        status: 'in_progress',
      },
      {
        id: 303,
        title: 'Literature Final',
        startTime: new Date(now - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(now - 5 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
        status: 'completed',
      },
    ]);
  }, []);

  // Helper function to get a human-friendly status label
  const getStatusLabel = (status: ExamItem['status']) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'upcoming':
      default:
        return 'Upcoming';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold mb-2">Your Exams</h1>
      {exams.length > 0 ? (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="p-4 border rounded-lg bg-white shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-gray-800">
                    {exam.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {exam.startTime.toLocaleString()} – {exam.endTime.toLocaleString()}
                  </p>
                  <span className="inline-block mt-1 text-xs uppercase tracking-wide text-gray-600">
                    Status: {getStatusLabel(exam.status)}
                  </span>
                </div>
                {/* Button to start or continue the exam */}
                {exam.status === 'completed' ? (
                  <Link
                    // Navigate to the results page.  The results route is defined
                    // as `results` in routes.tsx, without a parameter.  If you
                    // implement a details view per exam result, update this
                    // link accordingly (e.g. `/results/${exam.id}`).
                    to={`/results`}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm"
                  >
                    View Result
                  </Link>
                ) : (
                  <Link
                    to={`/exam/${exam.id}`}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    {exam.status === 'upcoming' ? 'Start' : 'Continue'}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No exams available at this time.</p>
      )}
    </div>
  );
};

export default ExamListPage;