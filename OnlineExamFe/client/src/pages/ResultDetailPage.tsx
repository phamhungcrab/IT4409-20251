import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { resultService, ExamDetailResult, ResultItem } from '../services/resultService';

/**
 * LocationState: dữ liệu đính kèm khi navigate từ trang danh sách
 */
type LocationState = {
  result?: ResultItem;
};

const ResultDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [detail, setDetail] = useState<ExamDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user || !examId) {
        setError('Thiếu thông tin người dùng hoặc mã bài thi.');
        setLoading(false);
        return;
      }

      const examIdNum = Number(examId);
      if (Number.isNaN(examIdNum)) {
        setError('Mã bài thi không hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        const res = await resultService.getExamDetail(examIdNum, user.id);
        if (!res) {
          setError('Không tìm thấy kết quả bài thi.');
        } else {
          setDetail(res);
        }
      } catch (e: any) {
        setError(e?.message || 'Không thể tải kết quả.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
          <p className="text-slate-400">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-card p-6 space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">Có lỗi xảy ra</h1>
          <p className="text-slate-300">{error || 'Không tìm thấy kết quả.'}</p>

          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => navigate('/results')} className="btn btn-primary">
              Quay lại danh sách
            </button>
            <button onClick={() => navigate('/exams')} className="btn btn-ghost border border-white/15">
              Danh sách kỳ thi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tính phần trăm đúng
  const percent = detail.totalQuestions > 0
    ? (detail.correctCount / detail.totalQuestions) * 100
    : 0;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* HEADER: Thông tin tổng quan */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Kết quả bài thi</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{detail.examName}</h1>
          </div>

          {/* Điểm lớn */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-sky-400">{detail.totalPoint.toFixed(1)}</div>
              <p className="text-sm text-slate-400">Điểm của bạn</p>
            </div>
          </div>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{detail.correctCount}</div>
            <p className="text-xs text-slate-400">Câu đúng</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{detail.totalQuestions}</div>
            <p className="text-xs text-slate-400">Tổng câu</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-sky-400">{percent.toFixed(0)}%</div>
            <p className="text-xs text-slate-400">Tỷ lệ đúng</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{detail.durationMinutes}</div>
            <p className="text-xs text-slate-400">Phút</p>
          </div>
        </div>

        {/* Thời gian */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Bắt đầu: {new Date(detail.startTimeStudent).toLocaleString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Nộp bài: {new Date(detail.endTimeStudent).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {/* Nút điều hướng */}
        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate('/results')} className="btn btn-primary">
            ← Quay lại
          </button>
          <button onClick={() => navigate('/exams')} className="btn btn-ghost border border-white/15">
            Làm bài thi khác
          </button>
        </div>
      </div>

      {/* CHI TIẾT TỪNG CÂU HỎI */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Chi tiết từng câu</h2>

        {detail.details.length === 0 ? (
          <p className="text-slate-400">Chưa có dữ liệu chi tiết.</p>
        ) : (
          <div className="space-y-4">
            {detail.details.map((q) => (
              <div
                key={q.questionId}
                className={`rounded-xl border p-4 transition ${
                  q.isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-rose-500/30 bg-rose-500/5'
                }`}
              >
                {/* Header câu hỏi */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        q.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        Câu {q.order}
                      </span>
                      {q.isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Đúng
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Sai
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium">{q.content}</p>
                  </div>

                  {/* Điểm */}
                  <div className="text-right">
                    <div className={`text-lg font-bold ${q.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {q.studentPoint}/{q.questionPoint}
                    </div>
                    <p className="text-xs text-slate-500">điểm</p>
                  </div>
                </div>

                {/* Đáp án */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {/* Đáp án của bạn */}
                  <div className={`p-3 rounded-lg border ${
                    q.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-rose-500/10 border-rose-500/20'
                  }`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Đáp án của bạn
                    </p>
                    <div className={`font-medium ${q.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {q.studentAnswer ? (
                        <ul className="space-y-1">
                          {q.studentAnswer.split('|').map((ans, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {ans.trim()}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="italic text-slate-500">Không trả lời</span>
                      )}
                    </div>
                  </div>

                  {/* Đáp án đúng */}
                  <div className="p-3 rounded-lg border bg-sky-500/10 border-sky-500/20">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Đáp án đúng
                    </p>
                    <ul className="font-medium text-sky-300 space-y-1">
                      {q.correctAnswer.split('|').map((ans, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {ans.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Danh sách đáp án gốc (nếu có) */}
                {q.cleanAnswer && q.cleanAnswer.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-slate-500 mb-2">Các đáp án:</p>
                    <div className="flex flex-wrap gap-2">
                      {q.cleanAnswer.map((ans, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded bg-white/5 text-xs text-slate-300"
                        >
                          {ans}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDetailPage;
