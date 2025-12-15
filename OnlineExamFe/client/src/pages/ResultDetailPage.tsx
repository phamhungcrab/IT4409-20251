import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { resultService, ResultItem } from '../services/resultService';

interface QuestionResult {
  questionId: number;
  questionContent: string;
  studentAnswer: string;
  correctAnswer: string;
  point: number;
  earned: number;
}

interface ResultDetail {
  examId: number;
  examName: string;
  status: string;
  startTime?: string;
  endTime?: string;
  totalScore: number;
  maxScore: number;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  questions: QuestionResult[];
}

const ResultDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [detail, setDetail] = useState<ResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user || !examId) {
        setError('Thiếu thông tin người dùng hoặc mã bài thi.');
        setLoading(false);
        return;
      }

      // hydrate from navigation state if available
      const stateResult = (location.state as any)?.result as ResultItem | undefined;
      if (stateResult && String(stateResult.examId) === examId) {
        // Show optimistic info while fetching chi ti §¨t
        setDetail((prev) => ({
          examId: stateResult.examId,
          examName: stateResult.examTitle,
          status: stateResult.status,
          totalScore: stateResult.score,
          maxScore: stateResult.score,
          totalQuestions: prev?.totalQuestions ?? 0,
          correctCount: prev?.correctCount ?? 0,
          percentage: prev?.percentage ?? 0,
          questions: prev?.questions ?? [],
        }));
      }

      try {
        const res = await resultService.getResultDetail(user.id, Number(examId));
        setDetail(res);
      } catch (e: any) {
        setError(e?.message || 'Không thể tải kết quả.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, examId, location.state]);

  if (loading) return <div className="p-6">{t('common.loading')}</div>;

  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-card p-6 space-y-3">
          <h1 className="text-2xl font-semibold text-white">Oops!</h1>
          <p className="text-slate-300">{error || 'Không tìm thấy kết quả.'}</p>
          <div className="flex gap-2">
            <button onClick={() => navigate('/results')} className="btn btn-primary">
              {t('nav.results')}
            </button>
            <button onClick={() => navigate('/')} className="btn btn-ghost border border-white/15">
              {t('nav.exams')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const percent = detail.totalQuestions && detail.totalQuestions > 0
    ? ((detail.correctCount ?? 0) / detail.totalQuestions) * 100
    : 0;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="glass-card p-6 space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">{t('nav.results')}</p>
        <h1 className="text-3xl font-semibold text-white">{detail.examName}</h1>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-200">
          <div className="space-y-1">
            <p>{t('exam.status')}: <span className="font-semibold text-white">{detail.status}</span></p>
            <p>{t('exam.startTime')}: {detail.startTime ? new Date(detail.startTime).toLocaleString() : '--'}</p>
            <p>{t('exam.endTime')}: {detail.endTime ? new Date(detail.endTime).toLocaleString() : '--'}</p>
          </div>
          <div className="space-y-1">
            <p>{t('exam.score')}: <span className="font-semibold text-white">{detail.totalScore.toFixed(2)} / {detail.maxScore.toFixed(2)}</span></p>
            <p>{t('exam.questions')}: <span className="font-semibold text-white">{detail.correctCount}/{detail.totalQuestions}</span></p>
            <p>% correct: <span className="font-semibold text-white">{percent.toFixed(1)}%</span></p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={() => navigate('/results')} className="btn btn-primary">
            {t('nav.results')}
          </button>
          <button onClick={() => navigate('/exams')} className="btn btn-ghost border border-white/15">
            {t('nav.exams')}
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Timeline</h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>Start: {detail.startTime ? new Date(detail.startTime).toLocaleString() : '--'}</li>
          <li>Submitted: {detail.endTime ? new Date(detail.endTime).toLocaleString() : '--'}</li>
        </ul>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Chi tiết câu hỏi</h3>
        {detail.questions.length === 0 ? (
          <p className="text-slate-300 text-sm">Chưa có dữ liệu chi tiết.</p>
        ) : (
          <div className="space-y-3">
            {detail.questions.map((q, idx) => (
              <div key={q.questionId} className="border border-white/10 rounded-xl p-4 bg-white/5">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-sky-200/70">Question {idx + 1}</p>
                    <p className="text-white font-semibold">{q.questionContent || `Question #${q.questionId}`}</p>
                  </div>
                  <span className={`tag ${q.earned > 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                    {q.earned} / {q.point}
                  </span>
                </div>
                <div className="text-sm text-slate-200 mt-2">
                  <p><span className="text-slate-400">Your answer:</span> {q.studentAnswer || '—'}</p>
                  <p><span className="text-slate-400">Correct:</span> {q.correctAnswer || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDetailPage;
