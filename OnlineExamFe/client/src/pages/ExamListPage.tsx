import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { examService } from '../services/examService';
import useAuth from '../hooks/useAuth';

interface Exam {
  id: number;
  name: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  status: string; // e.g., 'Scheduled', 'Ongoing', 'Completed'
}

const ExamListPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      if (!user) return;
      try {
        const data = await examService.getStudentExams(user.id);
        setExams(data);
      } catch (error) {
        console.error('Failed to fetch exams', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  const handleStartExam = async (examId: number) => {
    if (!user) return;
    try {
      const response = await examService.startExam({
          examId,
          studentId: user.id,
          classId: 1, // Placeholder
          blueprintId: 1, // Placeholder
          durationMinutes: 60 // Placeholder
      });

      if (response.status === 'success' || response.wsUrl) {
          navigate(`/exam/${examId}`, { state: { wsUrl: response.wsUrl } });
      } else {
          alert('Could not start exam. Please try again.');
      }
    } catch (error) {
      console.error('Error starting exam', error);
      alert('Error starting exam');
    }
  };

  if (loading) return <div>{t('common.loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('exam.listTitle')}</h1>

      {exams.length === 0 ? (
        <p className="text-gray-600">{t('exam.noExams')}</p>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-blue-700">{exam.name}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  <p>{t('exam.duration')}: {exam.durationMinutes} mins</p>
                  <p>{t('exam.startTime')}: {new Date(exam.startTime).toLocaleString()}</p>
                  <p>{t('exam.status')}: <span className="font-medium text-gray-700">{exam.status}</span></p>
                </div>
              </div>
              <button
                onClick={() => handleStartExam(exam.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                {t('exam.startExam')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamListPage;