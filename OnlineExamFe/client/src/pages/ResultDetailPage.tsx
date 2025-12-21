import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { resultService, ResultItem } from '../services/resultService';

/**
 * QuestionResult: kết quả của 1 câu hỏi trong trang chi tiết.
 *
 * Giải thích ý nghĩa các trường:
 * - questionId:
 *   Mã câu hỏi (dùng làm key khi render danh sách và để đối chiếu dữ liệu).
 *
 * - questionContent:
 *   Nội dung câu hỏi hiển thị cho người dùng.
 *
 * - studentAnswer:
 *   Câu trả lời của học sinh. Nếu câu nhiều đáp án, BE có thể nối bằng ký tự,
 *   ví dụ: "A|B|C" (tuỳ cách BE thiết kế).
 *
 * - correctAnswer:
 *   Đáp án đúng. Nếu nhiều đáp án có thể là "A|C" (tuỳ BE).
 *
 * - point:
 *   Điểm tối đa của câu hỏi.
 *
 * - earned:
 *   Điểm thực tế học sinh nhận được cho câu đó (có thể 0, hoặc = point,
 *   hoặc có thể lẻ nếu BE chấm theo mức độ đúng).
 */
interface QuestionResult {
  questionId: number;
  questionContent: string;
  studentAnswer: string;
  correctAnswer: string;
  point: number;
  earned: number;
}

/**
 * ResultDetail: dữ liệu tổng hợp cho 1 bài thi sau khi nộp.
 *
 * Gồm:
 * - Thông tin tổng quan (tên bài, trạng thái, thời gian, điểm số)
 * - Thông tin chi tiết (danh sách câu hỏi + đáp án + điểm từng câu)
 *
 * Lưu ý:
 * - startTime/endTime là optional (có thể BE không trả).
 * - percentage: có thể BE trả sẵn hoặc FE tự tính lại.
 */
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

/**
 * LocationState: kiểu dữ liệu “đính kèm” khi điều hướng bằng navigate().
 *
 * Ví dụ:
 * navigate('/results/16', { state: { result: item } })
 * => Trang đích đọc lại bằng useLocation().state
 */
type LocationState = {
  result?: ResultItem;
};

const ResultDetailPage: React.FC = () => {
  /**
   * Lấy examId từ URL (route param).
   * Ví dụ route: /results/:examId
   * - Vào /results/10 => examId = "10" (string)
   */
  const { examId } = useParams<{ examId: string }>();

  /**
   * Lấy user từ useAuth().
   * - Nếu user null/undefined: có thể chưa đăng nhập, hoặc dữ liệu user chưa kịp load.
   */
  const { user } = useAuth();

  // Điều hướng bằng code (VD: bấm nút quay lại trang danh sách kết quả)
  const navigate = useNavigate();

  // i18n: t('key') để lấy text theo ngôn ngữ hiện tại
  const { t } = useTranslation();

  /**
   * useLocation() cho biết thông tin vị trí hiện tại và “state” được gửi kèm.
   * - location.state là dữ liệu bạn gửi kèm khi navigate từ trang trước.
   * - Dùng để hiển thị “tạm” dữ liệu cơ bản ngay (giảm cảm giác chờ).
   */
  const location = useLocation();

  /**
   * detail:
   * - Dữ liệu chi tiết kết quả bài thi (khi load xong sẽ set vào đây)
   *
   * loading:
   * - Đang tải dữ liệu (hiển thị loading)
   *
   * error:
   * - Lỗi khi tải dữ liệu (hiển thị thông báo lỗi)
   */
  const [detail, setDetail] = useState<ResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect:
   * - Đây là nơi chạy “side-effect” (tác vụ phụ) như gọi API.
   * - Nó chạy khi component mount (vừa vào trang) và khi dependencies thay đổi.
   *
   * Dependencies ở đây:
   * - user: đổi user thì phải load lại đúng dữ liệu của user đó
   * - examId: đổi bài thi thì phải load lại kết quả bài thi mới
   * - location.state: nếu bạn điều hướng lại cùng trang nhưng gửi state khác
   */
  useEffect(() => {
    const load = async () => {
      // 1) Kiểm tra dữ liệu đầu vào bắt buộc
      if (!user || !examId) {
        setError('Thiếu thông tin người dùng hoặc mã bài thi.');
        setLoading(false);
        return;
      }

      // 2) Chuyển examId từ string sang number và kiểm tra hợp lệ
      const examIdNum = Number(examId);
      if (Number.isNaN(examIdNum)) {
        setError('Mã bài thi không hợp lệ.');
        setLoading(false);
        return;
      }

      /**
       * 3) Hiển thị dữ liệu “tạm” nếu trang trước có gửi kèm state.result
       *
       * Khái niệm quan trọng: “Hiển thị tạm trước” (thường gọi là optimistic UI)
       * - Nghĩa là: không chờ API xong mới vẽ giao diện.
       * - Nếu có dữ liệu cơ bản từ trang trước, ta dựng UI trước để user thấy ngay.
       * - Sau đó vẫn gọi API để lấy dữ liệu đầy đủ và cập nhật lại.
       */
      const state = location.state as LocationState | null;
      const stateResult = state?.result;

      const hasOptimisticData = Boolean(
        stateResult && String(stateResult.examId) === String(examIdNum)
      );

      if (hasOptimisticData && stateResult) {
        // Áp dụng ngay dữ liệu cơ bản để UI hiển thị nhanh
        setDetail({
          examId: stateResult.examId,
          examName: stateResult.examTitle,
          status: stateResult.status,
          totalScore: stateResult.score,

          // Dữ liệu “tạm” vì chưa có đầy đủ từ server
          // maxScore: tạm dùng score hiện có (nếu bạn có maxScore thật từ danh sách thì thay vào)
          maxScore: stateResult.score,
          startTime: stateResult.submittedAt,
          endTime: stateResult.submittedAt,
          totalQuestions: 0,
          correctCount: 0,
          percentage: 0,
          questions: [],
        });

        // Tắt loading để người dùng thấy giao diện ngay
        setLoading(false);
      }

      // 4) Luôn gọi API để lấy dữ liệu chi tiết đầy đủ
      try {
        const res = await resultService.getResultDetail(user.id, examIdNum);
        setDetail(res);
      } catch (e: any) {
        /**
         * Nếu không có dữ liệu tạm trước đó mà API lỗi => hiển thị lỗi rõ ràng
         * Nếu đã có dữ liệu tạm => có thể chỉ log lỗi / hoặc show toast nhẹ (tuỳ bạn)
         */
        if (!hasOptimisticData) {
          setError(e?.message || 'Không thể tải kết quả.');
        } else {
          console.error('Không lấy được dữ liệu chi tiết đầy đủ:', e);
        }
      } finally {
        // Nếu trước đó đã tắt loading rồi thì setLoading(false) lần nữa cũng không sao
        setLoading(false);
      }
    };

    load();
  }, [user, examId, location.state]);

  /**
   * Khi loading = true => hiển thị thông báo đang tải.
   * Lưu ý: nếu có dữ liệu tạm, loading đã bị tắt để UI hiện nhanh.
   */
  if (loading) return <div className="p-6">{t('common.loading')}</div>;

  /**
   * Nếu có lỗi hoặc không có detail => hiển thị hộp thông báo + nút điều hướng.
   */
  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-card p-6 space-y-3">
          <h1 className="text-2xl font-semibold text-white">Có lỗi xảy ra</h1>
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

  /**
   * Tính phần trăm đúng ở frontend (phòng khi BE không trả hoặc trả sai).
   * Tránh chia cho 0 bằng cách kiểm tra totalQuestions > 0.
   */
  const computedPercent =
    detail.totalQuestions && detail.totalQuestions > 0
      ? ((detail.correctCount ?? 0) / detail.totalQuestions) * 100
      : 0;

  // Ưu tiên dùng percentage từ server nếu có, nếu không thì dùng FE tự tính
  const percent = Number.isFinite(detail.percentage) && detail.percentage >= 0 ? detail.percentage : computedPercent;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* KHỐI 1: Tổng quan kết quả */}
      <div className="glass-card p-6 space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">{t('nav.results')}</p>
        <h1 className="text-3xl font-semibold text-white">{detail.examName}</h1>

        <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-200">
          <div className="space-y-1">
            <p>
              {t('exam.status')}:{' '}
              <span className="font-semibold text-white">{detail.status}</span>
            </p>
            <p>
              {t('exam.startTime')}:{' '}
              {detail.startTime ? new Date(detail.startTime).toLocaleString() : '--'}
            </p>
            <p>
              {t('exam.endTime')}:{' '}
              {detail.endTime ? new Date(detail.endTime).toLocaleString() : '--'}
            </p>
          </div>

          <div className="space-y-1">
            <p>
              {t('exam.score')}:{' '}
              <span className="font-semibold text-white">
                {detail.totalScore.toFixed(2)} / {detail.maxScore.toFixed(2)}
              </span>
            </p>
            <p>
              {t('exam.questions')}:{' '}
              <span className="font-semibold text-white">
                {detail.correctCount}/{detail.totalQuestions}
              </span>
            </p>
            <p>
              % đúng:{' '}
              <span className="font-semibold text-white">{percent.toFixed(1)}%</span>
            </p>
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

      {/* KHỐI 2: Dòng thời gian */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Dòng thời gian</h3>

        <ul className="text-sm text-slate-300 space-y-1">
          <li>Bắt đầu: {detail.startTime ? new Date(detail.startTime).toLocaleString() : '--'}</li>
          <li>Nộp bài: {detail.endTime ? new Date(detail.endTime).toLocaleString() : '--'}</li>
        </ul>
      </div>

      {/* KHỐI 3: Chi tiết từng câu hỏi */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Chi tiết câu hỏi</h3>

        {detail.questions.length === 0 ? (
          <p className="text-slate-300 text-sm">Chưa có dữ liệu chi tiết.</p>
        ) : (
          <div className="space-y-3">
            {detail.questions.map((q, idx) => (
              <div
                key={q.questionId}
                className="border border-white/10 rounded-xl p-4 bg-white/5"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-sky-200/70">
                      Câu {idx + 1}
                    </p>
                    <p className="text-white font-semibold">
                      {q.questionContent || `Câu hỏi #${q.questionId}`}
                    </p>
                  </div>

                  {/* Nhãn điểm: earned/point. earned > 0 coi như đúng (tuỳ BE chấm có điểm lẻ thì bạn có thể đổi điều kiện) */}
                  <span className={`tag ${q.earned > 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                    {q.earned} / {q.point}
                  </span>
                </div>

                {/* Khối so sánh đáp án: đáp án bạn chọn vs đáp án đúng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-900/40 rounded-lg p-3 border border-white/5">
                  {/* Cột 1: Bài làm của bạn */}
                  <div
                    className={`p-3 rounded-md border ${
                      q.earned > 0
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-rose-500/10 border-rose-500/20'
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
                      Bài làm của bạn
                    </p>

                    <div className={`font-medium ${q.earned > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {q.studentAnswer ? (
                        <span className="flex items-center gap-2">
                          {q.earned > 0 ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {q.studentAnswer}
                        </span>
                      ) : (
                        <span className="italic text-slate-500">Không chọn đáp án</span>
                      )}
                    </div>
                  </div>

                  {/* Cột 2: Đáp án đúng */}
                  <div className="p-3 rounded-md border border-sky-500/20 bg-sky-500/5">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
                      Đáp án đúng
                    </p>

                    <div className="font-medium text-sky-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {q.correctAnswer}
                    </div>
                  </div>
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
