import React, { useState, useEffect } from 'react';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import ResultTable, { ResultItem } from '../../components/ResultTable';
import { Link } from 'react-router-dom';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { examService } from '../../services/examService';
import { resultService } from '../../services/resultService';
import { ExamDto } from '../../types/exam';

interface StudentDashboardProps {
  user: any;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const { announcements } = useAnnouncements(user);
  const [upcomingExams, setUpcomingExams] = useState<ExamDto[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user && user.id) {
        try {
          // 1. Get Exams
          const examsData = await examService.getStudentExams(user.id);
          setUpcomingExams(examsData);

          // 2. Get Results
          const resultsData = await resultService.getResultsByStudent(user.id);
          setResults(resultsData);
        } catch (err) {
          console.error('Failed to load student dashboard data', err);
        }
      }
    };

    fetchStudentData();
  }, [user]);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-200/70">Welcome back</p>
          <h1 className="text-3xl font-semibold text-white mt-1">Your exam cockpit</h1>
          <p className="text-sm text-slate-300 mt-2">
            Theo dõi thông báo, bài thi sắp tới và kết quả tại một nơi.
          </p>
        </div>

        <div className="glass-card px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-200 font-semibold">
            {upcomingExams.length}
          </div>
          <div>
            <p className="text-xs text-slate-300">Upcoming exams</p>
            <p className="text-lg font-semibold text-white">
              {upcomingExams.length > 0 ? 'Ready to go' : 'All clear'}
            </p>
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
                    {exam.name ? exam.name.slice(0, 2).toUpperCase() : 'EX'}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{exam.name}</h3>
                    <p className="text-sm text-slate-300">
                      Bắt đầu: {new Date(exam.startTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-300">
                      Kết thúc: {new Date(exam.endTime).toLocaleString()}
                    </p>
                  </div>

                  <Link to={`/exam/${exam.id}`} className="btn btn-primary text-sm">
                    Enter
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-300">Hiện không có bài thi sắp tới.</p>
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
    </>
  );
};

export default StudentDashboard;
