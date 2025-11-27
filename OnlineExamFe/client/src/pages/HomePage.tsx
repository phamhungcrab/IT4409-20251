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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-200/70">Welcome back</p>
          <h1 className="text-3xl font-semibold text-white mt-1">Your exam cockpit</h1>
          <p className="text-sm text-slate-300 mt-2">
            Track announcements, upcoming exams, and results in a single, calm space.
          </p>
        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-200 font-semibold">
            {upcomingExams.length}
          </div>
          <div>
            <p className="text-xs text-slate-300">Upcoming exams</p>
            <p className="text-lg font-semibold text-white">{upcomingExams.length > 0 ? 'Ready to go' : 'All clear'}</p>
          </div>
        </div>
      </div>

      <AnnouncementBanner announcements={announcements} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-300">Schedule</p>
              <h2 className="text-xl font-semibold text-white">Upcoming Exams</h2>
            </div>
            <span className="tag">
              <span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden />
              Live
            </span>
          </div>
          {upcomingExams.length > 0 ? (
            <ul className="space-y-3">
              {upcomingExams.map((exam) => (
                <li
                  key={exam.id}
                  className="panel p-4 flex items-start gap-3 hover:border-white/30"
                >
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-sky-500/20 text-white font-semibold">
                    {exam.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{exam.title}</h3>
                    <p className="text-sm text-slate-300">
                      Starts: {exam.startTime.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-300">
                      Ends: {exam.endTime.toLocaleString()}
                    </p>
                  </div>
                  <Link to={`/exams/${exam.id}`} className="btn btn-primary text-sm">
                    Enter
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-300">You have no upcoming exams at this time.</p>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-300">Performance</p>
              <h2 className="text-xl font-semibold text-white">Recent Results</h2>
            </div>
            <span className="tag">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              Updated
            </span>
          </div>
          <ResultTable results={results} />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
