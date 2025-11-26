/**
 * HomePage component.
 *
 * This page serves as the landing page for authenticated users (typically
 * students).  It displays any active announcements via the
 * `AnnouncementBanner` component, shows a list of upcoming exams with their
 * scheduled times, and presents a table of recent results using the
 * `ResultTable` component.  In a real implementation you would fetch
 * announcements, exams and results from your API.  Here we stub them out
 * with sample data to demonstrate layout and component interactions.  The
 * UI uses Tailwind CSS utility classes; adjust or replace as needed.
 */

import React, { useState, useEffect } from 'react';
import AnnouncementBanner, { Announcement } from '../components/AnnouncementBanner';
import ResultTable, { ResultItem } from '../components/ResultTable';
import { Link } from 'react-router-dom';

interface UpcomingExam {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
}

const HomePage: React.FC = () => {
  // For demonstration, we define some mock announcements, upcoming exams,
  // and results.  These could be replaced with API calls via useEffect
  // and your hooks (e.g. useExam, useAnnouncements) once those are
  // implemented.  Times are in UTC; convert to local in the UI.
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);

  useEffect(() => {
    // Sample announcements
    setAnnouncements([
      { id: 1, message: 'Welcome to the Online Examination System!', type: 'success' },
      { id: 2, message: 'Don\'t forget to check your upcoming exams below.', type: 'info' }
    ]);

    // Sample upcoming exams (start/end times stored as UTC)
    setUpcomingExams([
      {
        id: 101,
        title: 'Mathematics Midterm',
        startTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000) // + 90 min
      },
      {
        id: 102,
        title: 'History Quiz',
        startTime: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
      }
    ]);

    // Sample results
    setResults([
      {
        id: 201,
        examTitle: 'Science Test',
        objectiveScore: 8.5,
        subjectiveScore: 7.5,
        totalScore: 16.0,
        status: 'Completed'
      },
      {
        id: 202,
        examTitle: 'English Placement',
        objectiveScore: 9.0,
        subjectiveScore: 8.0,
        totalScore: 17.0,
        status: 'Completed'
      }
    ]);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Announcements banner at the top */}
      <AnnouncementBanner announcements={announcements} />

      {/* Upcoming exams section */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Upcoming Exams</h2>
        {upcomingExams.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {upcomingExams.map((exam) => (
              <li key={exam.id} className="py-2 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {/* Convert UTC to local timezone for display */}
                    Starts: {exam.startTime.toLocaleString()} | Ends: {exam.endTime.toLocaleString()}
                  </p>
                </div>
                <Link
                  to={`/exams/${exam.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Enter
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You have no upcoming exams at this time.</p>
        )}
      </section>

      {/* Recent results section */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent Results</h2>
        <ResultTable results={results} />
      </section>
    </div>
  );
};

export default HomePage;