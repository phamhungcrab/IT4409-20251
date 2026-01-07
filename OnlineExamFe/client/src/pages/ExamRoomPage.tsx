import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { useExam } from '../hooks/useExam';
import { useTimer } from '../hooks/useTimer';
import { useExamIntegrity } from '../hooks/useExamIntegrity';
import QuestionCard from '../components/QuestionCard';
import { examService } from '../services/examService';

/**
 * Question:
 * - Kiểu dữ liệu câu hỏi dùng trong phòng thi ở phía Frontend.
 *
 * Giải thích trường:
 * - id:
 *   Mã câu hỏi (dùng để lưu đáp án theo questionId, sync lên server, dùng làm key khi render list).
 *
 * - text:
 *   Nội dung câu hỏi hiển thị cho người dùng.
 *
 * - type:
 *   Loại câu hỏi:
 *   - 1: chọn 1 đáp án (radio)
 *   - 2: chọn nhiều đáp án (checkbox)
 *   - 3: tự luận (nhập text)
 *   (Tuỳ backend quy ước, FE chỉ cần “thống nhất” với backend)
 *
 * - order:
 *   Thứ tự câu hỏi (rất quan trọng nếu backend sync theo thứ tự).
 *
 * - options:
 *   Danh sách đáp án (chỉ có với câu trắc nghiệm).
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
 *
 * Đây là trang làm bài thi của sinh viên.
 *
 * Luồng tổng quan (đọc để hiểu toàn bộ trang đang làm gì):
 * 1) Lấy examId từ URL: /exam/:examId
 * 2) Nhận wsUrl/duration/questions từ location.state (tức là dữ liệu trang trước gửi sang)
 * 3) Khởi tạo WebSocket bằng useExam() để:
 *    - Đồng bộ đáp án theo thời gian thực (mỗi lần chọn là gửi lên server)
 *    - Khi vào phòng thi có thể “kéo lại đáp án đã làm” nếu đang làm dở
 * 4) Khởi tạo đồng hồ đếm ngược bằng useTimer()
 *    - Hết giờ thì tự động submit
 * 5) Render UI:
 *    - Hiển thị 1 câu hiện tại
 *    - Nút prev/next
 *    - Lưới số câu để nhảy nhanh
 *
 * Lưu ý quan trọng (người mới hay gặp):
 * - location.state thường sẽ MẤT khi bạn F5/refresh.
 * - Vì vậy code có phần “khôi phục trạng thái” (recovery) bằng cách gọi API lại.
 */
const ExamRoomPage: React.FC = () => {
  /**
   * i18n:
   * - t('key') để lấy text theo ngôn ngữ hiện tại.
   */
  const { t } = useTranslation();

  /**
   * useParams:
   * - Lấy tham số động từ URL.
   * - examId luôn là string (vì URL là chuỗi), nên khi cần số phải Number(examId).
   */
  const { examId } = useParams<{ examId: string }>();

  /**
   * useLocation:
   * - Lấy thông tin route hiện tại.
   * - location.state là “gói dữ liệu” được gửi kèm khi navigate từ trang trước.
   */

  const location = useLocation();

  /**
   * useNavigate:
   * - Dùng để điều hướng/chuyển trang bằng code.
   */
  const navigate = useNavigate();

  /**
   * useAuth:
   * - Lấy user hiện tại (đang đăng nhập).
   */
  const { user } = useAuth();

  // =========================================================
  // 1) DỮ LIỆU NHẬN TỪ TRANG TRƯỚC (thường là ExamListPage)
  // =========================================================

  /**
   * wsUrl:
   * - URL WebSocket do backend trả về khi bắt đầu làm bài.
   *
   * duration:
   * - Thời lượng bài thi (phút).
   * - Nếu trang trước không gửi duration thì mặc định 60.
   *
   * initialQuestions:
   * - Danh sách câu hỏi mà trang trước đã nhận từ backend và truyền sang.
   */
  const wsUrl = (location.state as any)?.wsUrl;
  const duration = (location.state as any)?.duration || 60;
  const initialQuestions = (location.state as any)?.questions || [];
  const examName = (location.state as any)?.examName || `Bài thi #${examId}`;

  // =========================================================
  // 2) STATE DÙNG ĐỂ HIỂN THỊ UI
  // =========================================================

  /**
   * questions:
   * - Danh sách câu hỏi dùng để render trong phòng thi.
   * - Ban đầu là [] và sẽ được set sau khi map từ dữ liệu backend.
   */
  const [questions, setQuestions] = useState<Question[]>([]);

  /**
   * answers:
   * - Lưu đáp án theo dạng: { [questionId]: answerText }
   *
   * Vì sao lại lưu answerText (chuỗi) thay vì lưu id?
   * - Vì backend có thể muốn nhận “nội dung đáp án” để chấm/sync,
   *   hoặc hệ thống đang thiết kế gửi text.
   *
   * Ví dụ:
   * - answers[12] = "A|C" hoặc "đáp án 1|đáp án 3" tuỳ mapping
   * - answers[15] = "B"
   * - answers[20] = "Bài tự luận ..."
   *
   * Dùng Record<number, any> vì câu tự luận có thể là string,
   * còn trắc nghiệm thường là string nối bằng '|'.
   */
  /*
   * answerStatus:
   * - Lưu trạng thái đồng bộ của từng câu hỏi:
   *   'synced': Đã được BE xác nhận (Tô xanh).
   *   'pending': Đã gửi/đang chờ/offline (Tô vàng).
   *   undefined: Chưa làm hoặc chưa rõ.
   */
  const [answerStatus, setAnswerStatus] = useState<Record<number, 'synced' | 'pending'>>({});

  const [answers, setAnswers] = useState<Record<number, any>>({});

  /**
   * currentQuestionIndex:
   * - Vị trí (index) của câu hỏi đang hiển thị trong mảng questions.
   * - Dùng để next/prev và nhảy nhanh.
   */
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  /**
   * showSubmitConfirm:
   * - Bật/tắt modal xác nhận nộp bài.
   */
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  /**
   * submitResult:
   * - Cờ hiển thị modal thông báo nộp bài thành công.
   */
  const [submitResult, setSubmitResult] = useState<{ success?: boolean } | null>(null);

  const {
    activeAlert,
    fullscreenGate,
    isFullscreenSupported,
    clearAlert,
    requestFullscreen,
    markLeftPage,
  } = useExamIntegrity({
    examId,
    enabled: Boolean(user && examId && !submitResult),
    focusLossThresholdMs: 5000,
    requireFullscreen: true,
    debug: import.meta.env.DEV,
  });

  // =========================================================
  // 3) BIẾN “KHÔI PHỤC” TRẠNG THÁI KHI REFRESH (RECOVERY)
  // =========================================================

  /**
   * internalWsUrl/internalDuration:
   * - Vì wsUrl/duration lấy từ location.state có thể mất khi refresh,
   *   ta lưu vào state nội bộ để có thể cập nhật lại khi recover.
   */
  const [internalWsUrl, setInternalWsUrl] = useState<string | undefined>(wsUrl);
  const [internalDuration, setInternalDuration] = useState<number>(duration);

  /**
   * timerStorageKey:
   * - Key dùng cho sessionStorage để lưu thời điểm bắt đầu đếm giờ.
   * - Mục tiêu: nếu refresh trang thì timer vẫn chạy đúng, không reset lại từ đầu.
   *
   * sessionStorage khác localStorage thế nào?
   * - sessionStorage: mất khi đóng tab/trình duyệt
   * - localStorage: còn lưu lâu dài (cho đến khi bạn xoá)
   */
  const timerStorageKey = examId ? `exam_${examId}_timer_start` : undefined;

  // Ref để break circular dependency giữa useTimer và useExam
  // useTimer cần gọi submitExam khi hết giờ, nhưng useExam lại cần setRemainingTime của useTimer
  const submitExamRef = React.useRef<() => void>(() => {});
  const submitResultRef = React.useRef(submitResult);

  // =========================================================
  // 4) HOOK ĐẾM GIỜ: useTimer (MOVE LÊN TRƯỚC)
  // =========================================================

  /**
   * useTimer(durationMinutes, onTimeUp, storageKey)
   */
  const { formattedTime, setRemainingTime } = useTimer(
    internalDuration,
    () => {
      alert(t('exam.timeUp'));
      // Gọi qua ref vì lúc này submitExam chưa được khởi tạo
      submitExamRef.current();
    },
    timerStorageKey
  );

  // =========================================================
  // 5) HOOK WEBSOCKET: useExam
  // =========================================================

  /**
   * useExam:
   * - Quản lý kết nối WebSocket và các thao tác.
   */
  const { connectionState, syncAnswer, submitExam } = useExam({
    wsUrl: internalWsUrl || '',
    studentId: user?.id || 0,
    examId: Number(examId),


    // NEW: Đồng bộ timer từ BE (BE gửi số giây còn lại mỗi giây)
    onTimeSync: setRemainingTime, // Giờ đã có setRemainingTime để dùng

    // NEW: Khi 1 câu trả lời được BE xác nhận (SubmitAnswer ACK)
    onAnswerSubmitted: (data: any) => {
      const qId = data.questionId ?? data.QuestionId;
      if (qId) {
        setAnswerStatus((prev) => ({ ...prev, [qId]: 'synced' }));
      }
    },

    onSynced: (syncedData) => {
      if (Array.isArray(syncedData)) {
        const incoming: Record<number, any> = {};
        const syncedIds: number[] = [];

        syncedData.forEach((item: any) => {
          const qId = item.questionId ?? item.QuestionId ?? item.id ?? item.Id;

          if (qId !== undefined && qId !== null) {
            syncedIds.push(qId);
            const raw = item.answer ?? item.Answer;

            // Nếu server trả dạng mảng thì nối thành chuỗi "a|b|c"
            if (Array.isArray(raw)) {
              incoming[qId] = raw.join('|');
            } else if (raw !== undefined && raw !== null) {
              incoming[qId] = String(raw);
            }
          }
        });

        // Merge đáp án từ server vào answers hiện tại
        if (Object.keys(incoming).length > 0) {
          setAnswers((prev) => ({ ...prev, ...incoming }));
        }

        // Cập nhật trạng thái synced cho các câu đã có trên server
        if (syncedIds.length > 0) {
          setAnswerStatus((prev) => {
            const next = { ...prev };
            syncedIds.forEach((id) => (next[id] = 'synced'));
            return next;
          });
        }
      }

      console.log(t('exam.synced'));
    },

    onSubmitted: () => {
      // Xoá timer storage
      if (timerStorageKey) sessionStorage.removeItem(timerStorageKey);

      // Hiển thị modal thành công (dùng submitResult như cờ)
      setSubmitResult({ success: true });
    },

    onError: (msg) => {
      // Bỏ alert lỗi "không được để trống" theo yêu cầu (kệ họ)
      if (
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('trống') ||
          msg.toLowerCase().includes('empty') ||
          msg.toLowerCase().includes('null'))
      ) {
        return;
      }
      alert(`${t('common.error')}: ${msg}`);
    }
  });

  // Cập nhật ref mỗi khi submitExam thay đổi
  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  useEffect(() => {
    submitResultRef.current = submitResult;
  }, [submitResult]);

  useEffect(() => {
    return () => {
      if (!submitResultRef.current) {
        markLeftPage('route-change');
      }
    };
  }, [markLeftPage]);

  // =========================================================
  // 6) HÀM MAP CÂU HỎI TỪ BACKEND -> FRONTEND + KHÔI PHỤC ĐÁP ÁN TỪ localStorage
  // =========================================================

  /**
   * mapAndSetQuestions(rawQuestions):
   * - Nhiệm vụ:
   *   1) Map dữ liệu câu hỏi từ backend (có thể PascalCase/camelCase) về kiểu Question của FE
   *   2) Set vào state questions
   *   3) Đọc localStorage để khôi phục đáp án đã chọn trước đó (tránh mất dữ liệu khi refresh)
   */

  const mapAndSetQuestions = (rawQuestions: any[]) => {
    const mappedQuestions: Question[] = rawQuestions.map((q: any, idx: number) => {
      /**
       * opts:
       * - Dữ liệu đáp án có thể nằm ở cleanAnswer hoặc CleanAnswer tuỳ backend.
       * - Nếu không có thì [].
       */
      const opts = (q.cleanAnswer ?? q.CleanAnswer ?? []) as any[];

      /**
       * rawType:
       * - Loại câu hỏi từ backend có thể nằm ở nhiều trường khác nhau.
       * - Ta đọc “linh hoạt” để tránh mismatch.
       */
      const rawType =
        q.type ??
        q.Type ??
        q.questionType ??
        q.QuestionType ??
        null;

      /**
       * qType:
       * - FE quy ước:
       *   1 = chọn 1
       *   2 = chọn nhiều
       *   3 = tự luận
       *
       * Backend trả type là string: "MULTIPLE_CHOICE" / "SINGLE_CHOICE"
       */
      let qType = 1; // mặc định: chọn 1

      if (typeof rawType === 'string') {
        const upper = rawType.toUpperCase();
        if (upper.includes('MULTI')) qType = 2;
        else qType = 1;
      } else if (typeof rawType === 'number') {
        // Fallback nếu backend trả số
        qType = rawType === 1 ? 2 : 1;
      }

      /**
       * options:
       * - Map list đáp án về dạng { id, text }.
       * - Ở đây id đang lấy theo thứ tự (optionIdx + 1).
       * - text lấy từ Content hoặc text hoặc chính opt (nếu opt là string).
       */
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

    /**
     * Khôi phục đáp án từ localStorage:
     * - Mỗi câu có key riêng: exam_{examId}_q_{questionId}
     * - Mục tiêu: refresh không mất đáp án đã chọn
     */
    const savedAnswers: Record<number, any> = {};

    mappedQuestions.forEach((q) => {
      const saved = localStorage.getItem(`exam_${examId}_q_${q.id}`);
      if (!saved) return;

      try {
        const parsed = JSON.parse(saved);

        /**
         * Trường hợp parsed là mảng id (ví dụ [1,3]) -> đổi sang text để đồng nhất answers
         */
        if (Array.isArray(parsed)) {
          const texts =
            q.options
              ?.filter((opt) => parsed.includes(opt.id))
              .map((opt) => opt.text) ?? [];
          savedAnswers[q.id] = texts.join('|');
        }
        /**
         * Trường hợp parsed là 1 số (ví dụ 2) -> đổi sang text đáp án
         */
        else if (typeof parsed === 'number') {
          const found = q.options?.find((opt) => opt.id === parsed);
          savedAnswers[q.id] = found ? found.text : String(parsed);
        }
        /**
         * Trường hợp còn lại (thường là string: "A|B" hoặc tự luận)
         */
        else {
          savedAnswers[q.id] = parsed;
        }
      } catch {
        // Nếu JSON.parse lỗi thì bỏ qua (tránh crash trang)
      }
    });

    if (Object.keys(savedAnswers).length > 0) {
      setAnswers((prev) => ({ ...prev, ...savedAnswers }));
    }
  };

  // =========================================================
  // 7) KHÔI PHỤC TRẠNG THÁI KHI REFRESH (NẾU location.state BỊ MẤT)
  // =========================================================

  useEffect(() => {
    /**
     * Nếu trang trước có gửi questions qua location.state
     * => dùng luôn để khỏi gọi API lại.
     */
    if (initialQuestions && initialQuestions.length > 0) {
      mapAndSetQuestions(initialQuestions);
      return;
    }

    /**
     * Nếu không có initialQuestions (thường do refresh/F5)
     * => gọi API startExam để lấy lại wsUrl + questions + duration.
     *
     * Lưu ý thực tế:
     * - Tuỳ backend, gọi startExam lần nữa có thể tạo phiên làm bài mới.
     * - Nếu muốn “resume phiên cũ”, backend cần API riêng hoặc startExam phải idempotent.
     */
    const recoverState = async () => {
      if (!user || !examId) return;

      try {
        const res = await examService.startExam({
          examId: Number(examId),
          studentId: user.id
        });

        if (res.wsUrl) setInternalWsUrl(res.wsUrl);

        // Nếu có data (status = 'create') -> dùng luôn
        if (res.data) {
          setInternalDuration(res.data.durationMinutes);
          mapAndSetQuestions(res.data.questions);
        }
        // Nếu không có data (status = 'in_progress') -> gọi API lấy đề riêng
        else if (res.status === 'in_progress') {
          const examData = await examService.getCurrentQuestion(Number(examId), user.id);
          if (examData) {
            setInternalDuration(examData.durationMinutes);
            mapAndSetQuestions(examData.questions);
          }
        }
      } catch (e) {
        console.error('Khôi phục phòng thi thất bại', e);

        // Fallback: hiển thị 1 “câu giả” để báo lỗi cho người dùng
        setQuestions([
          {
            id: 1,
            text: 'Không tải được câu hỏi. Vui lòng quay lại danh sách.',
            type: 1,
            order: 1,
            options: []
          }
        ]);
      }
    };

    recoverState();
  }, [initialQuestions, examId, user]);

  // =========================================================
  // 8) XỬ LÝ CHỌN ĐÁP ÁN + ĐỒNG BỘ + LƯU localStorage
  // =========================================================

  /**
   * normalizeText:
   * - Chuẩn hoá chuỗi để so sánh “bớt nhạy cảm”.
   * - Ví dụ: " A  B " và "ab" sẽ được đưa về dạng giống nhau.
   *
   * Vì sao cần?
   * - Vì answers đang lưu theo text, còn UI lại cần map ngược text -> option id.
   * - Chuẩn hoá giúp giảm lỗi do khác khoảng trắng/hoa-thường.
   */
  const normalizeText = (value: string) => value.trim().replace(/\s+/g, '').toLowerCase();

  /**
   * mapAnswerTextToIds(answerText, question):
   * - Chuyển chuỗi đáp án đã lưu (VD: "A|C") thành mảng id đáp án (VD: [1,3])
   * - Vì một số component con (QuestionCard/OptionList) thường làm việc với id.
   */
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

  /**
   * handleAnswer(questionId, order, answer):
   * - Được gọi khi user chọn đáp án trong QuestionCard.
   *
   * Việc cần làm:
   * 1) Biến đáp án từ UI (id hoặc mảng id hoặc text tự luận) -> thành answerText
   * 2) setAnswers để UI cập nhật ngay
   * 3) syncAnswer để gửi realtime lên server
   * 4) lưu localStorage để refresh không mất
   */
  const handleAnswer = (questionId: number, order: number, answer: any) => {
    const q = questions.find((item) => item.id === questionId);

    let answerText = '';

    // Câu tự luận (type=3): lấy nguyên text
    if (q?.type === 3) {
      answerText = typeof answer === 'string' ? answer : String(answer ?? '');
    } else {
      // Trắc nghiệm: answer thường là id hoặc mảng id
      const ids =
        Array.isArray(answer) ? answer : typeof answer === 'number' ? [answer] : [];

      // Map id -> text để gửi lên server theo dạng "text1|text2"
      const selectedOpts =
        q?.options?.filter((opt) => ids.includes(opt.id)).map((opt) => opt.text) ?? [];

      answerText = selectedOpts.join('|');
    }

    // (1) cập nhật UI & đánh dấu pending (Vàng)
    setAnswers((prev) => ({ ...prev, [questionId]: answerText }));
    setAnswerStatus((prev) => ({ ...prev, [questionId]: 'pending' }));

    // (2) đồng bộ realtime lên server
    syncAnswer(questionId, order, answerText);

    // (3) lưu localStorage để refresh không mất đáp án
    localStorage.setItem(`exam_${examId}_q_${questionId}`, JSON.stringify(answerText));
  };

  /**
   * handleSubmit:
   * - Mở modal xác nhận nộp bài.
   */
  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  /**
   * confirmSubmit:
   * - Đóng modal và gửi lệnh nộp bài qua WebSocket.
   */
  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    submitExam();
  };

  /**
   * cancelSubmit:
   * - Đóng modal, không nộp.
   */
  const cancelSubmit = () => setShowSubmitConfirm(false);

  /**
   * Guard đơn giản:
   * - Nếu thiếu user hoặc examId -> phiên làm bài không hợp lệ.
   * - Thực tế có thể navigate về /login hoặc /exams.
   */
  if (!user || !examId) return <div>Phiên làm bài không hợp lệ</div>;

  // =========================================================
  // 9) TÍNH CÂU HIỆN TẠI + ĐÁP ÁN HIỆN TẠI
  // =========================================================

  const currentQuestion = questions[currentQuestionIndex];

  /**
   * selectedValue:
   * - Lấy đáp án đã lưu của câu hiện tại từ answers.
   * - Dạng thường là string (VD: "Đáp án A|Đáp án C") hoặc tự luận.
   */
  const selectedValue = currentQuestion ? answers[currentQuestion.id] : undefined;

  /**
   * selectedOptions:
   * - QuestionCard/OptionList thường cần mảng id (number[])
   * - Nên ta map từ selectedValue (text) -> id[]
   */
  const selectedOptions = (() => {
    if (!currentQuestion || !selectedValue) return [];
    return mapAnswerTextToIds(selectedValue, currentQuestion);
  })();

  /**
   * getConnectionStatusText:
   * - Đổi trạng thái kết nối WebSocket thành text để hiển thị.
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

  const focusLossSeconds =
    activeAlert?.kind === 'focus-loss'
      ? Math.max(5, Math.ceil((activeAlert.durationMs ?? 0) / 1000))
      : 5;

  const integrityTitle = activeAlert
    ? activeAlert.kind === 'focus-loss'
      ? t('exam.integrity.focusLossTitle')
      : t('exam.integrity.leftPageTitle')
    : '';

  const integrityBody = activeAlert
    ? activeAlert.kind === 'focus-loss'
      ? t('exam.integrity.focusLossBody', { seconds: focusLossSeconds })
      : t('exam.integrity.leftPageBody')
    : '';

  const fullscreenTitle =
    fullscreenGate === 'exit'
      ? t('exam.integrity.fullscreenExitTitle')
      : t('exam.integrity.fullscreenRequiredTitle');

  const fullscreenBody =
    fullscreenGate === 'exit'
      ? t('exam.integrity.fullscreenExitBody')
      : t('exam.integrity.fullscreenRequiredBody');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header dính trên cùng: trạng thái kết nối, timer, nút nộp */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-200/70">Đang làm bài</p>

            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">{examName}</h1>

              {/* Badge trạng thái WebSocket: connected / reconnecting / disconnected */}
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

      {/* Cảnh báo offline */}
      {(connectionState === 'disconnected' || connectionState === 'reconnecting') && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 text-center text-sm font-medium text-amber-300 animate-pulse">
            ⚠️ Đang mất kết nối máy chủ. Đừng lo, đáp án của bạn đang được lưu offline và sẽ tự động gửi khi có mạng lại. Vui lòng KHÔNG đóng tab này.
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row">
          {/* Cột trái: câu hỏi hiện tại + prev/next */}
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
              {/* Previous: khóa khi đang ở câu đầu */}
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="btn btn-ghost px-4 py-2 disabled:opacity-40"
              >
                {t('exam.previous')}
              </button>

              {/* Next: khóa khi đang ở câu cuối */}
              <button
                disabled={currentQuestionIndex === questions.length - 1}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="btn btn-primary px-4 py-2 disabled:opacity-40"
              >
                {t('exam.next')}
              </button>
            </div>
          </div>

          {/* Cột phải: lưới số câu + thông tin auto-sync */}
          <aside className="w-full lg:w-72 space-y-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white mb-3">{t('exam.questions')}</h3>

              {/*
                Lưới số câu:
                - Click để nhảy đến câu đó.
                - Nếu answers[q.id] có dữ liệu -> coi là “đã làm” (viền xanh).
                - Nếu đang ở câu hiện tại -> nền xanh.
              */}
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-4">
                {questions.map((q, idx) => {
                  const status = answerStatus[q.id];
                  const hasAnswer = !!answers[q.id];

                  // Logic màu sắc:
                  // - Synced (Xanh): Đã được server xác nhận
                  // - Pending (Vàng): Có đáp án nhưng chưa synced (hoặc local)
                  // - Default: Chưa làm
                  let borderClass = 'border-white/10';
                  let bgClass = ''; // default bg is handle below logic

                  if (status === 'synced') {
                    borderClass = 'border-emerald-400 bg-emerald-500/20 text-emerald-100';
                  } else if (status === 'pending') {
                    borderClass = 'border-amber-400 bg-amber-500/20 text-amber-100';
                  } else if (hasAnswer) {
                    // Có đáp án nhưng không rõ status (thường là mới load trang chưa sync xong)
                    // -> Mặc định coi là pending (Vàng) hoặc để trắng tuỳ ý.
                    // User yêu cầu: "chưa tick thi không tô màu".
                    // Nếu đã tick (hasAnswer) mà chưa sync -> tốt nhất nên là Vàng.
                    borderClass = 'border-amber-400/50 bg-amber-500/10 text-amber-100/70';
                  }

                  return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition border
                      ${currentQuestionIndex === idx ? 'bg-sky-600 text-white ring-2 ring-sky-300' : 'bg-white/5'}
                      ${borderClass}
                    `}
                    aria-label={`${t('exam.questions')} ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-4 space-y-2">
              <p className="text-sm text-slate-300">Tự động đồng bộ (auto-sync) đang bật</p>
              <p className="text-xs text-slate-400">Đáp án của bạn được đồng bộ theo thời gian thực.</p>
            </div>
          </aside>
        </div>
      </main>

      {/* Modal thông báo nộp bài thành công */}
      {submitResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-8 w-full max-w-md shadow-xl space-y-6 text-center">
            {/* Icon thành công */}
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Nội dung */}
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-white">
                Nộp bài thành công!
              </h3>
              <p className="text-slate-400">
                Bài làm của bạn đã được ghi nhận. Bạn có thể xem kết quả trong mục Kết quả.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSubmitResult(null);
                  navigate('/exams');
                }}
                className="btn btn-ghost px-4 py-2 border border-white/15"
              >
                {t('nav.exams') || 'Về danh sách'}
              </button>
              <button
                onClick={() => {
                  setSubmitResult(null);
                  navigate('/results');
                }}
                className="btn btn-primary px-4 py-2"
              >
                {t('nav.results') || 'Xem kết quả'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận nộp bài */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">{t('exam.submitExam')}</h3>
              <p className="text-sm text-slate-300">{t('exam.confirmSubmit')}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelSubmit}
                className="btn btn-ghost px-4 py-2 border border-white/15"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmSubmit}
                className="btn btn-primary px-4 py-2"
              >
                {t('exam.submitExam')}
              </button>
            </div>
          </div>
        </div>
      )}

      {fullscreenGate && isFullscreenSupported && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-center">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-white">{fullscreenTitle}</h3>
              <p className="text-sm text-slate-300">{fullscreenBody}</p>
              {fullscreenGate === 'exit' && (
                <p className="text-xs text-amber-200/90">
                  {t('exam.integrity.warningNote')}
                </p>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={requestFullscreen}
                className="btn btn-primary px-5 py-2"
              >
                {t('exam.integrity.enterFullscreen')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAlert && !fullscreenGate && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4 text-center">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-white">{integrityTitle}</h3>
              <p className="text-sm text-slate-300">{integrityBody}</p>
              <p className="text-xs text-amber-200/90">
                {t('exam.integrity.warningNote')}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={clearAlert}
                className="btn btn-primary px-5 py-2"
              >
                {t('exam.integrity.acknowledge')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRoomPage;

/**
 * Giải thích các khái niệm dễ “vấp” cho người mới:
 *
 * 1) location.state là gì?
 * - Khi bạn navigate sang trang khác, bạn có thể gửi kèm dữ liệu:
 *   navigate('/exam/12', { state: { wsUrl, questions, duration } })
 * - Trang đích đọc bằng useLocation().state
 * - Nhược điểm: refresh (F5) thường làm mất state => phải có recovery logic.
 *
 * 2) WebSocket dùng để làm gì trong phòng thi?
 * - WebSocket là kết nối “2 chiều” giữa client và server, giữ kết nối liên tục.
 * - Ứng dụng phòng thi thường dùng WS để:
 *   + Đồng bộ đáp án theo thời gian thực (tránh mất dữ liệu)
 *   + Cho phép resume (đang làm dở -> vào lại vẫn có đáp án)
 *
 * 3) “Đổ dữ liệu vào state” (hydrate) nghĩa là gì?
 * - Khi bạn lấy dữ liệu từ server/localStorage rồi set vào state React,
 *   UI sẽ render theo dữ liệu đó. Quá trình đó thường được gọi là “hydrate”.
 *
 * 4) Vì sao phải đọc nhiều kiểu tên field (PascalCase/camelCase)?
 * - Backend C# hay trả PascalCase (QuestionId)
 * - Frontend JS hay dùng camelCase (questionId)
 * - Nếu không thống nhất, FE sẽ “không đọc được” dữ liệu => nên normalize.
 */
