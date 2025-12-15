import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { useExam } from '../hooks/useExam';
import { useTimer } from '../hooks/useTimer';
import QuestionCard from '../components/QuestionCard';
import { examService } from '../services/examService';

/**
 * Question:
 *  - Kiểu dữ liệu câu hỏi hiển thị trong phòng thi.
 *  - id      : id câu hỏi (để lưu đáp án, sync lên server)
 *  - text    : nội dung câu hỏi
 *  - type    : loại câu hỏi (ví dụ 1 = chọn 1, 2 = chọn nhiều, 3 = tự luận... tùy BE)
 *  - order   : thứ tự câu hỏi (quan trọng vì backend WS thường sync theo Order)
 *  - options : danh sách đáp án (chỉ có với trắc nghiệm)
 */
interface Question {
  id: number;
  text: string;
  type: number;
  order: number;
  options?: { id: number; text: string }[];
}

/**
 * ExamRoomPage (Phòng thi):
 *  - Trang làm bài thi của sinh viên.
 *  - Nhận dữ liệu từ trang danh sách bài thi (ExamListPage) thông qua location.state:
 *      + wsUrl      : URL WebSocket để realtime sync
 *      + duration   : thời lượng bài thi (phút)
 *      + questions  : danh sách câu hỏi đã được backend tạo
 *
 * Luồng tổng quan:
 *  1) Lấy examId từ URL (/exam/:examId).
 *  2) Lấy wsUrl/duration/questions từ location.state (dữ liệu được navigate từ trang trước).
 *  3) Khởi tạo WebSocket bằng useExam() để:
 *      - Sync đáp án mỗi khi chọn (SubmitAnswer)
 *      - Khi vào phòng thi thì SyncState để lấy đáp án đã làm trước đó (nếu đang in_progress)
 *  4) Khởi tạo timer bằng useTimer():
 *      - Đếm ngược theo duration
 *      - Hết giờ thì auto submit.
 *  5) Render giao diện:
 *      - 1 câu hỏi hiện tại (QuestionCard)
 *      - Nút prev/next
 *      - Lưới số câu để nhảy nhanh
 *
 * Lưu ý:
 *  - Nếu người dùng F5 (refresh), location.state có thể bị mất -> không còn questions/wsUrl.
 *    Khi đó trang sẽ rơi vào “No questions loaded...”.
 *    (Giải pháp tốt hơn: fetch lại theo examId hoặc lấy cache từ localStorage.)
 */
const ExamRoomPage: React.FC = () => {
  /**
   * i18next:
   *  - t(key): lấy text đa ngôn ngữ.
   */
  const { t } = useTranslation();

  /**
   * useParams:
   *  - Lấy tham số động trên URL.
   *  - Route: /exam/:examId => examId là string.
   */
  const { examId } = useParams<{ examId: string }>();

  /**
   * useLocation:
   *  - Lấy thông tin location hiện tại.
   *  - location.state: dữ liệu được truyền khi navigate (giống như “gói dữ liệu” đi kèm chuyển trang).
   */
  const location = useLocation();

  /**
   * useNavigate:
   *  - Dùng để chuyển trang bằng code.
   */
  const navigate = useNavigate();

  /**
   * useAuth:
   *  - Lấy user hiện tại (student).
   */
  const { user } = useAuth();

  // ========================
  // DỮ LIỆU NHẬN TỪ TRANG TRƯỚC (ExamListPage)
  // ========================

  /**
   * wsUrl:
   *  - URL WebSocket do backend trả về khi start-exam.
   *  - Thường có dạng wss://.../ws/exam?token=...
   *
   * duration:
   *  - Thời lượng bài thi, nếu không có thì mặc định 60.
   *
   * initialQuestions:
   *  - Danh sách câu hỏi đã được backend tạo.
   */
  const wsUrl = location.state?.wsUrl;
  const duration = location.state?.duration || 60;
  const initialQuestions = location.state?.questions || [];

  // ========================
  // STATE CHO UI
  // ========================

  /**
   * questions:
   *  - Danh sách câu hỏi hiển thị.
   *  - Được map từ initialQuestions (PascalCase/camelCase) sang dạng chuẩn FE.
   */
  const [questions, setQuestions] = useState<Question[]>([]);

  /**
   * answers:
   *  - Lưu đáp án theo dạng: { [questionId]: answer }
   *  - Ví dụ:
   *      answers[12] = [1,3] (chọn nhiều)
   *      answers[15] = [2]   (chọn 1) hoặc đơn giản là 2 (tùy QuestionCard/OptionList)
   *  - Dùng Record<number, any> vì answer có thể là number[] hoặc string (tự luận).
   */
  const [answers, setAnswers] = useState<Record<number, any>>({});

  /**
   * currentQuestionIndex:
   *  - Index câu hỏi đang hiển thị.
   *  - Dùng để next/prev và nhảy câu.
   */
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ score?: number; maxScore?: number } | null>(null);

  // ========================
  // RECOVERY STATE
  // ========================
  const [internalWsUrl, setInternalWsUrl] = useState<string | undefined>(wsUrl);
  const [internalDuration, setInternalDuration] = useState<number>(duration);
  const timerStorageKey = examId ? `exam_${examId}_timer_start` : undefined;

  // ========================
  // WEBSOCKET HOOK: useExam
  // ========================

  /**
   * useExam:
   *  - Hook quản lý kết nối WebSocket và giao thức realtime của backend.
   *
   * Các tham số quan trọng:
   *  - wsUrl      : URL WS
   *  - studentId  : id sinh viên
   *  - examId     : id bài thi
   *
   * Callback:
   *  - onSynced:
   *      + Khi WS kết nối xong, client thường gửi SyncState.
   *      + Server có thể trả về danh sách đáp án đã lưu trước đó (in_progress).
   *      + Ta “hydrate” (đổ) đáp án vào state answers để UI hiển thị lại.
   *  - onSubmitted:
   *      + Khi submit xong, server trả kết quả (ví dụ score).
   *      + Ta alert và chuyển sang /results.
   *  - onError: hiển thị lỗi.
   */
  const { connectionState, syncAnswer, submitExam } = useExam({
    wsUrl: internalWsUrl || '',
    studentId: user?.id || 0,
    examId: Number(examId),

    onSynced: (syncedData) => {
      /**
       * syncedData có thể là:
       *  - mảng đáp án cached từ server.
       *
       * Vì backend có thể trả key theo PascalCase (QuestionId/Answer)
       * hoặc camelCase (questionId/answer), ta normalize về 1 format.
       */
      if (Array.isArray(syncedData)) {
        const incoming: Record<number, any> = {};

        syncedData.forEach((item: any) => {
          // Ưu tiên đọc theo nhiều kiểu tên field để không bị “lệch format”
          const qId = item.questionId ?? item.QuestionId ?? item.id ?? item.Id;
          if (qId !== undefined && qId !== null) {
            const raw = item.answer ?? item.Answer;
            if (Array.isArray(raw)) {
              incoming[qId] = raw.join('|');
            } else if (raw !== undefined && raw !== null) {
              incoming[qId] = String(raw);
            }
          }
        });

        // Nếu có đáp án từ server thì merge vào answers hiện tại
        if (Object.keys(incoming).length > 0) {
          setAnswers((prev) => ({ ...prev, ...incoming }));
        }
      }

      // Log một message (có thể thay bằng toast)
      console.log(t('exam.synced'));
    },

    onSubmitted: (result) => {
      if (timerStorageKey) sessionStorage.removeItem(timerStorageKey);
      setSubmitResult({ score: result?.score, maxScore: result?.maxScore });
    },

    onError: (msg) => alert(`${t('common.error')}: ${msg}`)
  });

  // ========================
  // TIMER HOOK: useTimer
  // ========================

  /**
   * useTimer(duration, onTimeUp):
   *  - duration ở đây đang là “phút” (mặc định 60).
   *  - Hook sẽ tạo đồng hồ đếm ngược và trả về formattedTime (vd: 59:12).
   *  - Khi hết giờ -> gọi callback:
   *      + alert hết giờ
   *      + tự động submitExam()
   */
  const { formattedTime } = useTimer(internalDuration, () => {
    alert(t('exam.timeUp'));
    submitExam();
  }, timerStorageKey);

  // ========================
  // MAP QUESTIONS + HYDRATE ANSWERS TỪ LOCALSTORAGE
  // ========================

  // Helper to map questions
  const mapAndSetQuestions = (rawQuestions: any[]) => {
      const mappedQuestions: Question[] = rawQuestions.map((q: any, idx: number) => {
        const opts = (q.cleanAnswer ?? q.CleanAnswer ?? []) as any[];
        const rawType =
          q.type ??
          q.Type ??
          q.questionType ??
          q.QuestionType ??
          null;

        const correctIds = q.correctOptionIds ?? q.CorrectOptionIds ?? [];

        let qType = 1; // default single/true-false (radio)
        if (typeof rawType === 'string') {
          const upper = rawType.toUpperCase();
          if (upper.includes('MULTI')) qType = 2;
          else qType = 1;
        } else if (typeof rawType === 'number') {
          // Backend enum: 0 = SINGLE_CHOICE, 1 = MULTIPLE_CHOICE, 2 = TRUE_FALSE
          qType = rawType === 1 ? 2 : 1;
        } else if (Array.isArray(correctIds) && correctIds.length > 1) {
          qType = 2; // infer multi from multiple correct options
        }
        const options = Array.isArray(opts)
          ? opts.map((opt: any, optionIdx: number) => ({
              id: optionIdx + 1,
              text: opt?.Content ?? opt?.text ?? opt
            }))
          : [];

        return {
          id: q.id ?? q.Id,
          text: q.content ?? q.Content ?? '',
          type: qType,
          order: q.order ?? q.Order ?? idx + 1,
          options
        };
      });

      setQuestions(mappedQuestions);

      // Restore answers from local storage
      const savedAnswers: Record<number, any> = {};
      mappedQuestions.forEach((q) => {
        const saved = localStorage.getItem(`exam_${examId}_q_${q.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              const texts = q.options
                ?.filter((opt) => parsed.includes(opt.id))
                .map((opt) => opt.text) ?? [];
              savedAnswers[q.id] = texts.join('|');
            } else if (typeof parsed === 'number') {
              const found = q.options?.find((opt) => opt.id === parsed);
              savedAnswers[q.id] = found ? found.text : String(parsed);
            } else {
              savedAnswers[q.id] = parsed;
            }
          } catch {}
        }
      });

      if (Object.keys(savedAnswers).length > 0) {
        setAnswers((prev) => ({ ...prev, ...savedAnswers }));
      }
  };

  // ========================
  // RECOVERY LOGIC (Handle Refresh)
  // ========================

  useEffect(() => {
    // If we have questions from navigation, use them
    if (initialQuestions && initialQuestions.length > 0) {
      mapAndSetQuestions(initialQuestions);
      return;
    }

    // Otherwise, try to recover state by calling startExam API again
    const recoverState = async () => {
       if (!user || !examId) return;
       try {
         const res = await examService.startExam({
             examId: Number(examId),
             studentId: user.id
         });

         if (res.wsUrl) setInternalWsUrl(res.wsUrl);
         if (res.data) {
             setInternalDuration(res.data.durationMinutes);
             mapAndSetQuestions(res.data.questions);
         }
       } catch (e) {
         console.error("Failed to recover exam state", e);
         setQuestions([{
             id: 1,
             text: 'Không tải được câu hỏi. Vui lòng quay lại danh sách.',
             type: 1,
             order: 1,
             options: []
         }]);
       }
    };
    recoverState();

  }, [initialQuestions, examId, user]);


  // ========================
  // XỬ LÝ CHỌN ĐÁP ÁN + SUBMIT
  // ========================

  /**
   * handleAnswer:
   *  - Được gọi khi user chọn đáp án ở QuestionCard.
   *  - Việc cần làm:
   *      1) Update answers trong state để UI phản ánh ngay.
   *      2) Gọi syncAnswer(...) để gửi lên server realtime.
   *
   * Vì backend yêu cầu Order/QuestionId/Answer, ta truyền cả questionId và order.
   */
  // Normalize option text for comparison (lowercase + strip whitespace)
  const normalizeText = (value: string) => value.trim().replace(/\s+/g, '').toLowerCase();

  const mapAnswerTextToIds = (answerText: string, question?: Question) => {
    if (!question || !answerText) return [];
    const tokens = answerText
      .split('|')
      .map((t) => normalizeText(t))
      .filter(Boolean);
    return (
      question.options
        ?.filter((opt) => tokens.includes(normalizeText(opt.text)))
        .map((opt) => opt.id) ?? []
    );
  };

  const handleAnswer = (questionId: number, order: number, answer: any) => {
    const q = questions.find((item) => item.id === questionId);

    let answerText = '';
    if (q?.type === 3) {
      answerText = typeof answer === 'string' ? answer : String(answer ?? '');
    } else {
      const ids =
        Array.isArray(answer) ? answer : typeof answer === 'number' ? [answer] : [];
      const selectedOpts =
        q?.options?.filter((opt) => ids.includes(opt.id)).map((opt) => opt.text) ?? [];
      answerText = selectedOpts.join('|');
    }

    setAnswers((prev) => ({ ...prev, [questionId]: answerText }));
    syncAnswer(questionId, order, answerText);
    localStorage.setItem(`exam_${examId}_q_${questionId}`, JSON.stringify(answerText));
  };

  /**
   * handleSubmit:
   *  - Xác nhận trước khi nộp.
   *  - Nếu đồng ý: submitExam() (WS gửi SubmitExam).
   */
  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    submitExam();
  };

  const cancelSubmit = () => setShowSubmitConfirm(false);

  /**
   * Guard đơn giản:
   *  - Nếu không có user hoặc không có examId => session không hợp lệ.
   *  - Thực tế có thể điều hướng về /login hoặc /exams thay vì chỉ render text.
   */
  if (!user || !examId) return <div>Phiên làm bài không hợp lệ</div>;

  // ========================
  // TÍNH TOÁN CÂU HIỆN TẠI + ĐÁP ÁN HIỆN TẠI
  // ========================

  const currentQuestion = questions[currentQuestionIndex];

  /**
   * selectedValue:
   *  - Lấy đáp án đã chọn của câu hiện tại từ answers.
   */
  const selectedValue = currentQuestion ? answers[currentQuestion.id] : undefined;

  /**
   * selectedOptions:
   *  - Một số component con (OptionList) mong muốn dạng mảng number[]
   *  - Nếu selectedValue không phải mảng thì trả về [] để tránh lỗi.
   */
  const selectedOptions = (() => {
    if (!currentQuestion || selectedValue === undefined || selectedValue === null) return [];
    const asString = Array.isArray(selectedValue)
      ? selectedValue.join('|')
      : typeof selectedValue === 'number'
        ? selectedValue.toString()
        : String(selectedValue);
    return mapAnswerTextToIds(asString, currentQuestion);
  })();

  /**
   * Chuyển trạng thái kết nối WS sang text đa ngôn ngữ.
   * connectionState thường là:
   *  - connected / reconnecting / disconnected
   */
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
      {/* Header dính trên cùng: hiển thị mã bài thi, trạng thái WS, timer, nút nộp */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-200/70">Exam room</p>

            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Exam #{examId}</h1>

              {/* Badge trạng thái kết nối WebSocket */}
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
            {/* Đồng hồ đếm ngược */}
            <div className="text-xl font-mono font-bold text-sky-100">{formattedTime}</div>

            {/* Nút nộp bài */}
            <button onClick={handleSubmit} className="btn btn-primary hover:-translate-y-0.5">
              {t('exam.submitExam')}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row">
          {/* Cột trái: hiển thị câu hỏi + nút prev/next */}
          <div className="flex-1 space-y-4">
            {currentQuestion && (
              <QuestionCard
                questionId={currentQuestion.id}
                orderIndex={currentQuestion.order}
                text={currentQuestion.text}
                questionType={currentQuestion.type}
                options={currentQuestion.options}
                selectedOptions={selectedOptions}
                onAnswer={(ans) => handleAnswer(currentQuestion.id, currentQuestion.order, ans)}
              />
            )}

            <div className="flex justify-between gap-3">
              {/* Nút Previous: disable khi đang ở câu đầu */}
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="btn btn-ghost px-4 py-2 disabled:opacity-40"
              >
                {t('exam.previous')}
              </button>

              {/* Nút Next: disable khi đang ở câu cuối */}
              <button
                disabled={currentQuestionIndex === questions.length - 1}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="btn btn-primary px-4 py-2 disabled:opacity-40"
              >
                {t('exam.next')}
              </button>
            </div>
          </div>

          {/* Cột phải: lưới số câu + trạng thái autosync */}
          <aside className="w-full lg:w-72 space-y-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white mb-3">{t('exam.questions')}</h3>

              {/*
                Lưới số câu:
                - Click số câu để nhảy thẳng tới câu đó.
                - Nếu câu đã có answers[q.id] => viền xanh (đã làm).
                - Nếu đang ở câu hiện tại => nền xanh.
              */}
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
              <p className="text-sm text-slate-300">Tự động đồng bộ (auto-sync) đang bật</p>
              <p className="text-xs text-slate-400">Đáp án của bạn được đồng bộ theo thời gian thực.</p>
            </div>
          </aside>
        </div>

      </main>


      {submitResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/80">{t('exam.submitted')}</p>
              <h3 className="text-2xl font-semibold text-white">{t('exam.score')}: {submitResult.score ?? 0}{submitResult.maxScore ? ` / ${submitResult.maxScore}` : ''}</h3>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSubmitResult(null)} className="btn btn-ghost px-4 py-2 border border-white/15">{t('common.close')}</button>
              <button onClick={() => navigate('/results')} className="btn btn-primary px-4 py-2">{t('nav.results')}</button>
            </div>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">{t('exam.submitExam')}</h3>
              <p className="text-sm text-slate-300">{t('exam.confirmSubmit')}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={cancelSubmit} className="btn btn-ghost px-4 py-2 border border-white/15">{t('common.cancel')}</button>
              <button onClick={confirmSubmit} className="btn btn-primary px-4 py-2">{t('exam.submitExam')}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExamRoomPage;

/**
 * Giải thích nhanh các khái niệm dễ vấp (người mới):
 *
 * 1) location.state là gì?
 *    - Là dữ liệu “đi kèm” khi navigate sang trang khác.
 *    - Ví dụ: navigate('/exam/12', { state: { wsUrl, questions, duration } })
 *    - Nhược điểm: refresh trang (F5) thì state thường mất.
 *
 * 2) WebSocket dùng để làm gì ở phòng thi?
 *    - Sync đáp án realtime lên server (chống mất dữ liệu nếu rớt mạng).
 *    - Cho phép resume (đang làm dở -> vào lại vẫn thấy đáp án đã làm).
 *
 * 3) Hydrate answers là gì?
 *    - “Đổ dữ liệu” đáp án đã có (từ server hoặc localStorage) vào state answers
 *      để UI hiển thị lại các lựa chọn.
 *
 * 4) Tại sao phải normalize PascalCase/camelCase?
 *    - Backend C# hay trả JSON PascalCase (QuestionId, CleanAnswer...)
 *    - Frontend JS thường dùng camelCase (questionId, cleanAnswer...)
 *    - Nên code phải đọc được cả 2 để tránh lỗi khi BE/FE không thống nhất.
 */
