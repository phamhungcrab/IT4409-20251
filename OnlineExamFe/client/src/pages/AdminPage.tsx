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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{t('admin.dashboard')}</h1>

      {/* Announcements Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('admin.announcements')}</h2>
        {announcementsLoading ? (
          <div>{t('common.loading')}</div>
        ) : (
          <AnnouncementBanner announcements={announcements} />
        )}
      </section>

      {/* Exam Management Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">{t('admin.allExams')}</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {t('admin.createExam')}
          </button>
        </div>

        {loadingExams ? (
          <div>{t('common.loading')}</div>
        ) : (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('exam.startTime')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('exam.duration')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(exam.startTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration} mins</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">{t('common.edit')}</button>
                      <button className="text-red-600 hover:text-red-900">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Student Management Placeholder */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('admin.students')}</h2>
        <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
          Student management interface coming soon...
        </div>
      </section>
    </div>
  );
};

export default AdminPage;