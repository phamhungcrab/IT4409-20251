import { useEffect, useRef, useState, useCallback } from 'react';
import { monitoringService } from '../services/monitoringService';

interface UseExamProps {
  wsUrl: string;
  studentId: number;
  examId: number;
  onTimeSync?: (remainingSeconds: number) => void;
  onSynced?: (data: any) => void;
  onSubmitted?: (result?: any) => void;
  onAnswerSubmitted?: (data: any) => void;
  onError?: (msg: string) => void;
}

type PendingAnswer = {
  questionId: number;
  order: number;
  answer: any;
};

export const useExam = ({
  wsUrl,
  studentId,
  examId,
  onSynced,
  onSubmitted,
  onAnswerSubmitted,
  onError,
  onTimeSync,
}: UseExamProps) => {
  const debugEnabled =
    typeof window !== 'undefined' &&
    (import.meta.env.DEV || localStorage.getItem('ws_debug') === '1');
  const debugLog = useCallback(
    (event: string, payload?: Record<string, unknown>) => {
      if (!debugEnabled) return;
      console.log('[useExam]', event, payload ?? {});
    },
    [debugEnabled]
  );

  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  >('disconnected');

  // Khởi tạo pending từ localStorage (persist qua F5)
  const loadPendingFromStorage = (): Map<number, PendingAnswer> => {
    try {
      const saved = localStorage.getItem(`exam_${examId}_pending`);
      if (saved) {
        const arr: PendingAnswer[] = JSON.parse(saved);
        return new Map(arr.map(p => [p.questionId, p]));
      }
    } catch {}
    return new Map();
  };
  const pendingAnswersRef = useRef<Map<number, PendingAnswer>>(loadPendingFromStorage());
  const hasConnectedRef = useRef(false);

  // Helper: Lưu pending vào localStorage
  const savePendingToStorage = useCallback(() => {
    try {
      const arr = Array.from(pendingAnswersRef.current.values());
      localStorage.setItem(`exam_${examId}_pending`, JSON.stringify(arr));
    } catch {}
  }, [examId]);

  // Helper: Xóa pending khỏi localStorage
  const clearPendingFromStorage = useCallback(() => {
    try {
      localStorage.removeItem(`exam_${examId}_pending`);
    } catch {}
  }, [examId]);

  // Ref giữ hàm để tránh re-declared function khi dependency thay đổi
  const onTimeSyncRef = useRef(onTimeSync);
  const onSyncedRef = useRef(onSynced);
  const onSubmittedRef = useRef(onSubmitted);
  const onAnswerSubmittedRef = useRef(onAnswerSubmitted);
  const onErrorRef = useRef(onError);

  // Heartbeat interval
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const submitForceCloseRef = useRef<NodeJS.Timeout | null>(null);
  const submitRequestedRef = useRef(false);

  // Update refs
  useEffect(() => {
    onTimeSyncRef.current = onTimeSync;
    onSyncedRef.current = onSynced;
    onSubmittedRef.current = onSubmitted;
    onAnswerSubmittedRef.current = onAnswerSubmitted;
    onErrorRef.current = onError;
  }, [onTimeSync, onSynced, onSubmitted, onAnswerSubmitted, onError]);

  const clearSubmitTimeout = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
  }, []);

  const clearSubmitForceClose = useCallback(() => {
    if (submitForceCloseRef.current) {
      clearTimeout(submitForceCloseRef.current);
      submitForceCloseRef.current = null;
    }
  }, []);

  const rememberPendingAnswer = useCallback(
    (questionId: number, order: number, answer: any) => {
      pendingAnswersRef.current.set(questionId, { questionId, order, answer });
      savePendingToStorage(); // Persist ngay
    },
    [savePendingToStorage]
  );

  const clearPendingAnswer = useCallback((questionId: number) => {
    pendingAnswersRef.current.delete(questionId);
    savePendingToStorage(); // Cập nhật storage
  }, [savePendingToStorage]);

  const clearPendingAnswers = useCallback((questionIds: number[]) => {
    if (questionIds.length === 0) return;
    questionIds.forEach((id) => pendingAnswersRef.current.delete(id));
    savePendingToStorage(); // Cập nhật storage
  }, [savePendingToStorage]);

  const flushPendingAnswers = useCallback(
    (reason: string) => {
      const pending = Array.from(pendingAnswersRef.current.values());
      if (pending.length === 0) return;
      debugLog('pending_flush', { count: pending.length, reason });
      pending.forEach((item) => {
        monitoringService.send({
          Action: 'SubmitAnswer',
          Order: item.order,
          QuestionId: item.questionId,
          Answer: item.answer
        });
      });
    },
    [debugLog]
  );

  // Lấy token
  const token = localStorage.getItem('token');

  /**
   * connect: Hàm thiết lập kết nối (ủy quyền cho MonitoringService)
   */
  const connect = useCallback(() => {
    if (!wsUrl) return;

    // Build URL với token
    const urlWithToken = token
      ? `${wsUrl}${wsUrl.includes('?') ? '&' : '?'}session=${encodeURIComponent(token)}`
      : wsUrl;
    const safeUrl = urlWithToken.replace(/session=[^&]+/, 'session=***');
    debugLog('connect', { url: safeUrl, examId, studentId });

    monitoringService.connect(
      urlWithToken,
      // 1. Callback nhận message
      (data) => {
        // Nhận thời gian đếm ngược (số hoặc chuỗi số)
        if (typeof data === 'number') {
          onTimeSyncRef.current?.(data);
          return;
        }
        if (typeof data === 'string' && /^\d+$/.test(data.trim())) {
          onTimeSyncRef.current?.(parseInt(data.trim(), 10));
          return;
        }

        // Nhận object message
        if (data.status === 'submitted') {
          const answerQuestionId = data.questionId ?? data.QuestionId;
          if (!answerQuestionId) {
            // SubmitExam ACK - Nộp bài xong
            submitRequestedRef.current = false;
            clearSubmitTimeout();
            clearSubmitForceClose();
            debugLog('submitted_ack');
            clearPendingFromStorage(); // Xóa pending khỏi localStorage
            monitoringService.disconnect();
            onSubmittedRef.current?.(data);
          } else {
            // ??y l? response c?a SubmitAnswer
            const ackAnswer = data.answer ?? data.Answer;
            const pending = pendingAnswersRef.current.get(answerQuestionId);
            if (!pending || pending.answer === ackAnswer) {
              clearPendingAnswer(answerQuestionId);
              debugLog('answer_ack', {
                questionId: answerQuestionId,
                order: data.order ?? data.Order
              });
              onAnswerSubmittedRef.current?.(data);
            } else {
              debugLog('answer_ack_ignored', {
                questionId: answerQuestionId,
                order: data.order ?? data.Order
              });
            }
          }
          return;
        }
        if (Array.isArray(data)) {
          const syncedIds = data
            .map((item: any) => item.questionId ?? item.QuestionId ?? item.id ?? item.Id)
            .filter((id: any): id is number => typeof id === 'number');
          if (syncedIds.length > 0) {
            clearPendingAnswers(syncedIds);
          }
          debugLog('sync_state', { count: data.length });
          onSyncedRef.current?.(data);
          return;
        }
        if (data.status === 'error' || data.type === 'error') {
          onErrorRef.current?.(data.message);
        }
      },
      // 2. Callback trạng thái
      (status) => {
        if (status === 'connected') {
          hasConnectedRef.current = true;
          setConnectionState('connected');
        } else if (status === 'connecting') {
          setConnectionState(hasConnectedRef.current ? 'reconnecting' : 'connecting');
        } else {
          setConnectionState('disconnected');
        }
        if (status === 'disconnected') {
          if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        }
      },
      // 3. Callback khi Open (để gửi SyncState & Heartbeat)
      () => {
        console.log('WS Open Callback triggered');
        // Gửi yêu cầu đồng bộ state
        monitoringService.send({ Action: 'SyncState' });

        // Thiết lập Heartbeat interval
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
            monitoringService.send({ Action: 'Heartbeat' });
        }, 30000); // 30 giây
      }
    );
  }, [clearPendingAnswer, clearPendingAnswers, clearSubmitForceClose, clearSubmitTimeout, debugLog, examId, studentId, wsUrl, token]);

  // Effect khởi tạo kết nối
  useEffect(() => {
    connect();

    // Cleanup khi unmount
    return () => {
      debugLog('cleanup_disconnect');
      console.log('[useExam] Cleanup - calling disconnect');
      monitoringService.disconnect();
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
      if (submitForceCloseRef.current) {
        clearTimeout(submitForceCloseRef.current);
        submitForceCloseRef.current = null;
      }
    };
  }, [connect, debugLog]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      debugLog('offline_event');
      setConnectionState('disconnected');
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      monitoringService.disconnect();
    };

    const handleOnline = () => {
      debugLog('online_event');
      connect();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [connect, debugLog]);

  useEffect(() => {
    if (connectionState !== 'connected') return;
    flushPendingAnswers('connected');
  }, [connectionState, flushPendingAnswers]);

  // Các hàm tiện ích gửi lên server
  const syncAnswer = useCallback(
    (questionId: number, order: number, answer: any) => {
      rememberPendingAnswer(questionId, order, answer);
      monitoringService.send({
        Action: 'SubmitAnswer',
        Order: order,
        QuestionId: questionId,
        Answer: answer
      });
      debugLog('answer_send', { questionId, order });

      // Fallback l??u local
      try {
        localStorage.setItem(
          `exam_${examId}_q_${questionId}`,
          JSON.stringify(answer)
        );
      } catch {}
    },
    [debugLog, examId, rememberPendingAnswer]
  );


  const submitExam = useCallback(() => {
    if (submitRequestedRef.current) return;
    submitRequestedRef.current = true;
    clearSubmitTimeout();
    clearSubmitForceClose();
    debugLog('submit_request');

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Check nếu đang offline -> Queue sẽ xử lý, không suppress reconnect
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const isConnected = connectionState === 'connected';

    if (isOnline && isConnected) {
      // Online: Gửi bình thường, suppress reconnect
      monitoringService.suppressReconnect('submit');
      monitoringService.send({ Action: 'SubmitExam' });

      submitForceCloseRef.current = setTimeout(() => {
        if (!submitRequestedRef.current) return;
        debugLog('submit_force_close');
        monitoringService.disconnect();
      }, 1200);

      submitTimeoutRef.current = setTimeout(() => {
        if (!submitRequestedRef.current) return;
        submitRequestedRef.current = false;
        debugLog('submit_fallback_close');
        monitoringService.disconnect();
        onSubmittedRef.current?.({ status: 'submitted', fallback: true });
      }, 4000);
    } else {
      // Offline: Queue SubmitExam, KHÔNG suppress reconnect
      debugLog('submit_offline_queued');
      monitoringService.send({ Action: 'SubmitExam' });
      // Thông báo user: Bài thi sẽ được nộp khi có mạng lại
      submitRequestedRef.current = false;
      onSubmittedRef.current?.({ status: 'submitted', offline: true });
    }
  }, [clearSubmitForceClose, clearSubmitTimeout, connectionState, debugLog]);

  return {
    connectionState,
    syncAnswer,
    submitExam
  };
};
