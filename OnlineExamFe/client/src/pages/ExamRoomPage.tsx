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

  const wsUrl = location.state?.wsUrl;
  const duration = location.state?.duration || 60;
  const initialQuestions = location.state?.questions || [];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const { formattedTime } = useTimer(duration, () => {
    alert(t('exam.timeUp'));
    submitExam();
  });

  useEffect(() => {
    if (initialQuestions.length > 0) {
      const mappedQuestions = initialQuestions.map((q: any) => {
        let options = [];
        try {
          if (q.cleanAnswer) {
             const parsed = JSON.parse(q.cleanAnswer);
             options = parsed.map((opt: any, idx: number) => ({
               id: idx + 1,
               text: opt.Content || opt.text || opt
             }));
          }
        } catch (e) {
          console.error('Failed to parse options', e);
        }

        return {
          id: q.id,
          text: q.content,
          type: q.type,
          options
        };
      });
      setQuestions(mappedQuestions);
    } else {
      setQuestions([
        { id: 1, text: 'No questions loaded. Please start from exam list.', type: 1, options: [] }
      ]);
    }
  }, []);

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
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
      case 'connected':
        return t('exam.connected');
      case 'reconnecting':
        return t('exam.reconnecting');
      case 'disconnected':
        return t('exam.disconnected');
      default:
        return state;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-200/70">Exam room</p>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Exam #{examId}</h1>
              <span
                className={`tag ${connectionState === 'connected' ? 'text-emerald-100' : 'text-amber-100'}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    connectionState === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  aria-hidden
                />
                {getConnectionStatusText(connectionState)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xl font-mono font-bold text-sky-100">
              {formattedTime}
            </div>
            <button
              onClick={handleSubmit}
              className="btn btn-primary hover:-translate-y-0.5"
            >
              {t('exam.submitExam')}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row">
          <div className="flex-1 space-y-4">
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

            <div className="flex justify-between gap-3">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="btn btn-ghost px-4 py-2 disabled:opacity-40"
              >
                {t('exam.previous')}
              </button>
              <button
                disabled={currentQuestionIndex === questions.length - 1}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="btn btn-primary px-4 py-2 disabled:opacity-40"
              >
                {t('exam.next')}
              </button>
            </div>
          </div>

          <aside className="w-full lg:w-72 space-y-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white mb-3">{t('exam.questions')}</h3>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-4">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition
                      ${currentQuestionIndex === idx ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-100'}
                      ${answers[q.id] ? 'border border-emerald-300/50' : 'border border-white/10'}
                    `}
                    aria-label={`${t('exam.questions')} ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 space-y-2">
              <p className="text-sm text-slate-300">Auto-sync enabled</p>
              <p className="text-xs text-slate-400">Your answers are synced in real-time.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ExamRoomPage;
