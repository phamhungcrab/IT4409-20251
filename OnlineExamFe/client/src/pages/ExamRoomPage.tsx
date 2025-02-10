import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { useExam } from '../hooks/useExam';
import { useTimer } from '../hooks/useTimer';
import QuestionCard from '../components/QuestionCard';

interface Question {
  id: number;
  text: string;
  type: number;
  options?: { id: number; text: string }[];
}

const ExamRoomPage: React.FC = () => {
  const { t } = useTranslation();
  const { examId } = useParams<{ examId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State from navigation or fetch
  const wsUrl = location.state?.wsUrl;
  const duration = location.state?.duration || 60;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Timer
  const { formattedTime } = useTimer(duration, () => {
    handleSubmit();
  });

  // WebSocket
  const { connectionState, syncAnswer, submitExam } = useExam({
    wsUrl,
    studentId: user?.id || 0,
    examId: Number(examId),
    onSynced: () => console.log(t('exam.synced')),
    onSubmitted: (result) => {
      alert(`${t('exam.submitted')} ${t('exam.score')}: ${result?.score}`);
      navigate('/results');
    },
    onError: (msg) => alert(`${t('common.error')}: ${msg}`)
  });

  useEffect(() => {
    // Mock questions for now if not passed
    setQuestions([
      { id: 1, text: 'What is 2+2?', type: 1, options: [{ id: 1, text: '3' }, { id: 2, text: '4' }] },
      { id: 2, text: 'Capital of France?', type: 1, options: [{ id: 3, text: 'Paris' }, { id: 4, text: 'London' }] }
    ]);
  }, []);

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    syncAnswer(questionId, answer);
  };

  const handleSubmit = () => {
    if (window.confirm(t('exam.confirmSubmit'))) {
        submitExam();
    }
  };

  if (!user || !examId) return <div>Invalid exam session</div>;

  const currentQuestion = questions[currentQuestionIndex];

  const getConnectionStatusText = (state: string) => {
    switch (state) {
      case 'connected': return t('exam.connected');
      case 'reconnecting': return t('exam.reconnecting');
      case 'disconnected': return t('exam.disconnected');
      default: return state;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Exam #{examId}</h1>
          <div className={`text-sm ${connectionState === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
            {connectionState === 'connected' ? `● ${getConnectionStatusText(connectionState)}` : `○ ${getConnectionStatusText(connectionState)}`}
          </div>
        </div>
        <div className="text-xl font-mono font-bold text-blue-600">
          {formattedTime}
        </div>
        <button
          onClick={handleSubmit}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          {t('exam.submitExam')}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 flex gap-6">
        {/* Question Area */}
        <div className="flex-1">
          {currentQuestion && (
            <QuestionCard
              questionId={currentQuestion.id}
              orderIndex={currentQuestionIndex + 1}
              text={currentQuestion.text}
              questionType={currentQuestion.type}
              options={currentQuestion.options}
              selectedOptions={answers[currentQuestion.id]}
              onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
            />
          )}

          <div className="mt-6 flex justify-between">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              {t('exam.previous')}
            </button>
            <button
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {t('exam.next')}
            </button>
          </div>
        </div>

        {/* Sidebar / Navigation */}
        <aside className="w-64 bg-white p-4 rounded shadow h-fit hidden md:block">
          <h3 className="font-semibold mb-4">{t('exam.questions')}</h3>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`p-2 text-center rounded text-sm font-medium
                  ${currentQuestionIndex === idx ? 'ring-2 ring-blue-500' : ''}
                  ${answers[q.id] ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}
                `}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ExamRoomPage;