import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { useExam } from '../hooks/useExam';
import { useTimer } from '../hooks/useTimer';
import { useExamIntegrity } from '../hooks/useExamIntegrity';
import QuestionCard from '../components/QuestionCard';
import { examService } from '../services/examService';
import { webRTCService } from '../services/webRTCService';

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
  /**
   * AnswerEntry: Gộp cả đáp án + trạng thái vào 1 object
   */
  type AnswerEntry = {
    answer: string;
    status: 'pending' | 'synced';
    order: number;
  };

  /**
   * answerMap: 1 Map duy nhất chứa tất cả thông tin đáp án
   * - Key: questionId
   * - Value: { answer, status, order }
   * - Persist vào localStorage để không mất khi F5
   */
  const answerMapStorageKey = `exam_${examId}_answerMap`;

  // Load từ localStorage khi khởi tạo
  const loadAnswerMap = (): Record<number, AnswerEntry> => {
    try {
      const saved = localStorage.getItem(answerMapStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  };

  const [answerMap, setAnswerMap] = useState<Record<number, AnswerEntry>>(loadAnswerMap);

  // Persist vào localStorage mỗi khi answerMap thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(answerMapStorageKey, JSON.stringify(answerMap));
    } catch {}
  }, [answerMap, answerMapStorageKey]);

  // Helper: Lấy answer text từ answerMap
  const getAnswer = (questionId: number): string | undefined => answerMap[questionId]?.answer;

  // Helper: Lấy status từ answerMap
  const getStatus = (questionId: number): 'pending' | 'synced' | undefined => answerMap[questionId]?.status;

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
   * - forceSubmitted: true nếu bài được nộp bởi giáo viên
   */
  const [submitResult, setSubmitResult] = useState<{ success?: boolean; forceSubmitted?: boolean; reason?: string } | null>(null);

  /**
   * duplicateConnectionError:
   * - Hiển thị khi phát hiện tài khoản đang được sử dụng ở thiết bị khác
   * - Chặn việc thi hộ bằng cách kiểm tra WS trước khi load đề
   */
  const [duplicateConnectionError, setDuplicateConnectionError] = useState(false);

  const {
    activeAlert,
    fullscreenGate,
    isFullscreenSupported,
    clearAlert,
    requestFullscreen,
    markLeftPage,
  } = useExamIntegrity({
    examId,
    studentId: user?.id,
    enabled: Boolean(user && examId && !submitResult),
    focusLossThresholdMs: 7000, // 7s threshold as per requirement
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
  // Ref để track việc đã hiện thông báo chưa (tránh spam khi re-render hoặc timer nhảy)
  const warningRef = React.useRef<{ [key: number]: boolean }>({});

  // 5) WebRTC / Proctoring
  const localVideoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Khởi tạo Camera
    webRTCService.startLocalStream().then((stream) => {
        if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
        }
    });

    return () => {
        webRTCService.closeAll();
    };
  }, []);

  // =========================
  // 6) ANTI-CHEAT UI PROTECTIONS
  // =========================
  useEffect(() => {
    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        return;
      }
      // Block Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        return;
      }
      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        return;
      }
      // Block F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      // Block Ctrl+Shift+I (DevTools alternate)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        return;
      }
    };

    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block copy/paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // Add print CSS dynamically
    const printStyle = document.createElement('style');
    printStyle.id = 'exam-anti-print-style';
    printStyle.textContent = `
      @media print {
        body * {
          display: none !important;
        }
        body::before {
          content: "Nội dung bài thi được bảo mật - Không được phép in!";
          display: block !important;
          font-size: 24px;
          color: red;
          text-align: center;
          padding: 100px;
        }
      }
    `;
    document.head.appendChild(printStyle);

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handleCopy);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handleCopy);
      const style = document.getElementById('exam-anti-print-style');
      if (style) style.remove();
    };
  }, []);

  /**
   * useTimer(durationMinutes, onTimeUp, storageKey)
   */
  const { formattedTime, timeLeft, setRemainingTime } = useTimer(
    internalDuration,
    () => {
      alert(t('exam.timeUp') || 'Hết giờ làm bài!');
      // Gọi qua ref vì lúc này submitExam chưa được khởi tạo
      submitExamRef.current();
    },
    timerStorageKey
  );

  // State thông báo đếm ngược (Toast)
  const [timeToast, setTimeToast] = useState<{ msg: string; type: 'warning' | 'error' } | null>(null);

  // Effect: Check thời gian để hiện cảnh báo
  useEffect(() => {
    // Reset warning flags nếu thời gian > 5 phút (trường hợp hack/test)
    if (timeLeft > 305) {
      warningRef.current = {};
    }

    // Ngưỡng cảnh báo: 5 phút (300s), 3 phút (180s), 1 phút (60s)
    const thresholds = [
      { sec: 300, msg: t('exam.warning.5min') || '⚠️ Chú ý: Còn lại 5 phút!' },
      { sec: 180, msg: t('exam.warning.3min') || '⚠️ Chú ý: Còn lại 3 phút!' },
      { sec: 60, msg: t('exam.warning.1min') || '🚨 GẤP: Còn 1 phút cuối cùng!', type: 'error' }
    ];

    thresholds.forEach(th => {
      // Nếu timeLeft chạm ngưỡng (trong khoảng 1s - 2s do timer interval)
      // và chưa warning -> hiện toast
      if (timeLeft <= th.sec && timeLeft > th.sec - 2 && !warningRef.current[th.sec]) {
        warningRef.current[th.sec] = true;
        setTimeToast({ msg: th.msg, type: (th.type as any) || 'warning' });

        // Tự tắt sau 5s
        setTimeout(() => setTimeToast(null), 5000);
      }
    });
  }, [timeLeft, t]);

  // Helper: Màu sắc đồng hồ
  const getTimerColor = (sec: number) => {
    if (sec <= 60) return 'text-red-500 font-bold animate-pulse'; // < 1 phút: Đỏ nhấp nháy
    if (sec <= 300) return 'text-amber-400 font-bold'; // < 5 phút: Vàng cam
    return 'text-sky-100'; // Bình thường
  };

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
        setAnswerMap((prev) => ({
          ...prev,
          [qId]: prev[qId] ? { ...prev[qId], status: 'synced' } : { answer: '', status: 'synced', order: 0 }
        }));
      }
    },

    onSynced: (syncedData) => {
      if (Array.isArray(syncedData)) {
        setAnswerMap((prev) => {
          const next = { ...prev };
          syncedData.forEach((item: any) => {
            const qId = item.questionId ?? item.QuestionId ?? item.id ?? item.Id;
            const orderVal = item.order ?? item.Order ?? 0;
            if (qId !== undefined && qId !== null) {
              const raw = item.answer ?? item.Answer;
              const answerText = Array.isArray(raw) ? raw.join('||') : String(raw ?? '');

              // Chỉ update nếu local chưa có hoặc local đang synced (không ghi đè pending)
              if (!next[qId] || next[qId].status === 'synced') {
                next[qId] = { answer: answerText, status: 'synced', order: orderVal };
              }
            }
          });
          return next;
        });
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
      // Ignore if it's actually a force submit signal disguised as error
      if (typeof msg === 'string' && msg.includes('force_submitted')) {
         return;
      }

      // Bỏ alert lỗi "không được để trống" theo yêu cầu (kệ họ)
      if (
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('trống') ||
          msg.toLowerCase().includes('empty') ||
          msg.toLowerCase().includes('null') ||
          msg.toLowerCase().includes('force') || // Ignore force related errors
          msg.toLowerCase().includes('closed'))  // Ignore closed exam errors (handled by force submit logic)
      ) {
        return;
      }
      alert(`${t('common.error')}: ${msg}`);
    },

    // Handle when teacher force submits this student's exam
    onForceSubmit: (reason) => {
      // Clear timer storage
      if (timerStorageKey) sessionStorage.removeItem(timerStorageKey);

      // Show force submit result
      setSubmitResult({
        success: true,
        forceSubmitted: true,
        reason: reason || 'Bài thi đã được nộp bởi giáo viên do phát hiện vi phạm.'
      });
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
          savedAnswers[q.id] = texts.join('||');
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
      // Merge saved answers vào answerMap với status 'synced' (đã có từ localStorage cũ)
      setAnswerMap((prev) => {
        const next = { ...prev };
        Object.entries(savedAnswers).forEach(([id, value]) => {
          const qId = Number(id);
          if (!next[qId]) {
            next[qId] = { answer: String(value), status: 'synced', order: qId };
          }
        });
        return next;
      });
    }
  };

  // =========================================================
  // 7) KHÔI PHỤC TRẠNG THÁI KHI REFRESH (NẾU location.state BỊ MẤT)
  // =========================================================

  /**
   * checkWsConnection(wsUrl):
   * - Kiểm tra xem có thể kết nối WebSocket không.
   * - Dùng để phát hiện trường hợp tài khoản đang được sử dụng ở thiết bị khác.
   * - BE trả 409 Conflict + "ALREADY_CONNECTED" nếu đã có người kết nối.
   *
   * @returns Promise<boolean> - true nếu kết nối được, false nếu bị chặn
   */
  const checkWsConnection = async (wsUrlToCheck: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const token = localStorage.getItem('token');
      const urlWithToken = token
        ? `${wsUrlToCheck}${wsUrlToCheck.includes('?') ? '&' : '?'}session=${encodeURIComponent(token)}`
        : wsUrlToCheck;

      const testSocket = new WebSocket(urlWithToken);
      const timeout = setTimeout(() => {
        testSocket.close();
        resolve(false); // Timeout = không kết nối được
      }, 5000); // 5s timeout

      testSocket.onopen = () => {
        clearTimeout(timeout);
        testSocket.close(); // Đóng ngay sau khi test thành công
        resolve(true);
      };

      testSocket.onerror = () => {
        clearTimeout(timeout);
        resolve(false); // Lỗi kết nối (có thể là 409)
      };

      testSocket.onclose = (event) => {
        clearTimeout(timeout);
        // Nếu close trước khi open (bị reject) thì false
        if (event.code !== 1000) {
          resolve(false);
        }
      };
    });
  };
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
        // Nếu không có data (status = 'in_progress') -> kiểm tra WS trước khi lấy đề
        else if (res.status === 'in_progress') {
          /**
           * ANTI-CHEAT: Kiểm tra WS connection trước khi cho phép lấy đề.
           * Nếu đã có người khác kết nối (thi hộ), WS sẽ bị reject với 409.
           * -> Không cho phép vào phòng thi.
           */
          if (res.wsUrl) {
            const wsOk = await checkWsConnection(res.wsUrl);
            if (!wsOk) {
              // Tài khoản đang được sử dụng ở thiết bị khác
              console.warn('[ExamRoom] WS connection rejected - duplicate session detected');
              setDuplicateConnectionError(true);
              return; // Không load đề, không vào phòng thi
            }
          }

          // WS OK -> Tiếp tục lấy đề như bình thường
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
      .split('||')
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

      answerText = selectedOpts.join('||');
    }

    // (1) Cập nhật answerMap với status pending (Vàng)
    setAnswerMap((prev) => ({
      ...prev,
      [questionId]: { answer: answerText, status: 'pending', order }
    }));

    // (2) đồng bộ realtime lên server
    syncAnswer(questionId, order, answerText);

    // (3) localStorage riêng không cần nữa vì answerMap đã persist
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
  const selectedValue = currentQuestion ? getAnswer(currentQuestion.id) : undefined;

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

  // =========================================================
  // UI: HIỂN THỊ LỖI KHI PHÁT HIỆN TÀI KHOẢN ĐANG ĐƯỢC SỬ DỤNG Ở THIẾT BỊ KHÁC
  // =========================================================
  if (duplicateConnectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-md p-8 bg-red-950/50 border border-red-500/30 rounded-2xl text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-red-300 mb-3">
            {t('exam.duplicateSession.title') || 'Phiên làm bài bị từ chối'}
          </h2>

          <p className="text-red-200/80 mb-6 leading-relaxed">
            {t('exam.duplicateSession.message') || 'Tài khoản của bạn đang được sử dụng để làm bài thi trên một thiết bị khác. Mỗi tài khoản chỉ được phép đăng nhập trên một thiết bị tại một thời điểm.'}
          </p>

          <div className="bg-red-900/30 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-300/70">
              {t('exam.duplicateSession.hint') || 'Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ giáo viên hoặc thử lại sau 1 phút.'}
            </p>
          </div>

          <button
            onClick={() => navigate('/classes')}
            className="btn bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-medium transition-all hover:-translate-y-0.5"
          >
            {t('exam.duplicateSession.backToList') || 'Quay về danh sách lớp học'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header dính trên cùng: trạng thái kết nối, timer, nút nộp */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-200/70">Đang làm bài</p>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="w-full text-lg font-semibold text-white break-words sm:w-auto sm:text-xl sm:max-w-[520px] sm:truncate">
                {examName}
              </h1>

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

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            {/* Đồng hồ đếm ngược */}
            <div className={`text-lg font-mono transition-colors duration-300 sm:text-xl ${getTimerColor(timeLeft)}`}>
              {formattedTime}
            </div>

            {/* Nút nộp bài */}
            <button onClick={handleSubmit} className="btn btn-primary w-full sm:w-auto hover:-translate-y-0.5">
              {t('exam.submitExam')}
            </button>
          </div>
        </div>
      </header>

      {/* Cảnh báo offline */}
      {(connectionState === 'disconnected' || connectionState === 'reconnecting') && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-center text-sm font-medium text-amber-300 animate-pulse sm:px-6">
            ⚠️ Đang mất kết nối máy chủ. Đừng lo, đáp án của bạn đang được lưu offline và sẽ tự động gửi khi có mạng lại. Vui lòng KHÔNG đóng tab này.
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
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
                  const entry = answerMap[q.id];
                  const status = entry?.status;
                  const hasAnswer = !!entry?.answer;

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
            {/* Icon - Warning for force submit, Success for normal */}
            {submitResult.forceSubmitted ? (
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : (
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Nội dung */}
            <div className="space-y-2">
              <h3 className={`text-2xl font-semibold ${submitResult.forceSubmitted ? 'text-red-500 uppercase tracking-wider' : 'text-white'}`}>
                {submitResult.forceSubmitted ? 'ĐÌNH CHỈ THI' : 'Nộp bài thành công!'}
              </h3>
              <p className="text-slate-400">
                {submitResult.forceSubmitted
                  ? (submitResult.reason || 'Giám thị đã thu bài của bạn do phát hiện dấu hiệu gian lận hoặc vi phạm quy chế thi. Kết quả sẽ được ghi nhận tại thời điểm này.')
                  : 'Bài làm của bạn đã được ghi nhận. Bạn có thể xem kết quả trong mục Kết quả.'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-3 pt-2">
              {submitResult.forceSubmitted ? (
                <button
                  onClick={() => {
                    setSubmitResult(null);
                    navigate('/exams');
                  }}
                  className="btn btn-primary px-6 py-2"
                >
                  Rời khỏi phòng thi
                </button>
              ) : (
                <>
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
                </>
              )}
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

      {/* Toast Cảnh báo thời gian */}
      {timeToast && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-bounce-in sm:left-auto sm:right-5">
          <div className={`px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 ${
            timeToast.type === 'error'
              ? 'bg-red-500/20 border-red-500/50 text-red-100'
              : 'bg-amber-500/20 border-amber-500/50 text-amber-100'
          }`}>
            <span className="text-2xl">{timeToast.type === 'error' ? '🚨' : '⚠️'}</span>
            <div className="font-semibold">{timeToast.msg}</div>
            <button
              onClick={() => setTimeToast(null)}
              className="ml-2 opacity-70 hover:opacity-100 hover:bg-white/10 rounded p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Proctoring Camera Loopback */}
      <div className="fixed bottom-3 left-3 z-40 bg-slate-900/80 backdrop-blur border border-white/20 rounded-lg overflow-hidden shadow-lg w-28 h-20 flex items-center justify-center group sm:bottom-4 sm:left-4 sm:w-40 sm:h-32">
         <video
            ref={localVideoRef}
            muted
            autoPlay
            playsInline
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror image for natural feel
         />
         {/* Recording Indicator */}
         <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500 animate-pulse border-2 border-slate-900" title="Monitoring Active"></div>
         <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-white text-xs font-semibold px-2 text-center">Monitoring Active</span>
         </div>
      </div>
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
