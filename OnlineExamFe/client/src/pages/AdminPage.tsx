import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnnouncements } from '../hooks/useAnnouncements';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { examService } from '../services/examService';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { announcements, loading: announcementsLoading } = useAnnouncements();
  const [exams, setExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examService.getAllExams();
        setExams(data);
      } catch (error) {
        console.error('Failed to fetch exams', error);
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <p className="text-sm text-slate-300">{t('admin.dashboard')}</p>
        <h1 className="text-3xl font-semibold text-white">Control & monitor exams</h1>
      </div>

      <section className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-slate-300">{t('admin.announcements')}</p>
            <h2 className="text-xl font-semibold text-white">Communicate with students</h2>
          </div>
          <span className="tag">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            Live
          </span>
        </div>
        {announcementsLoading ? (
          <div>{t('common.loading')}</div>
        ) : (
          <AnnouncementBanner announcements={announcements} />
        )}
      </section>

      <section className="glass-card p-5">
        <div className="flex justify-between items-center mb-4 gap-3">
          <div>
            <p className="text-sm text-slate-300">{t('admin.allExams')}</p>
            <h2 className="text-xl font-semibold text-white">Exam management</h2>
          </div>
          <button className="btn btn-primary hover:-translate-y-0.5">
            {t('admin.createExam')}
          </button>
        </div>

        {loadingExams ? (
          <div>{t('common.loading')}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">{t('exam.startTime')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">{t('exam.duration')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-200/90 uppercase tracking-wide">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{exam.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{exam.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(exam.startTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{exam.duration} mins</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="tag hover:border-white/30 hover:text-white">{t('common.edit')}</button>
                      <button className="tag hover:border-rose-300/50 hover:text-rose-100 border-rose-300/30 text-rose-100">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-300">{t('admin.students')}</p>
            <h2 className="text-xl font-semibold text-white">Student management</h2>
          </div>
          <span className="tag">
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
            Coming soon
          </span>
        </div>
        <div className="panel p-4 text-center text-slate-300">
          Student management interface coming soon...
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
