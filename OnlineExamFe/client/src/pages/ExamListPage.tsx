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
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-300">{t('exam.listTitle')}</p>
        <h1 className="text-3xl font-semibold text-white">Available exams</h1>
      </div>

      {exams.length === 0 ? (
        <div className="glass-card p-6 text-slate-300">
          {t('exam.noExams')}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="glass-card p-5 flex flex-col gap-4 justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{exam.name}</h3>
                  <span className="tag">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    {exam.status}
                  </span>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <p>{t('exam.duration')}: {exam.durationMinutes} mins</p>
                  <p>{t('exam.startTime')}: {new Date(exam.startTime).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => handleStartExam(exam.id)}
                className="btn btn-primary hover:-translate-y-0.5"
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
