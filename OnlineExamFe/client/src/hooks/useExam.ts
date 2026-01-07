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
          // Chỉ trigger modal nộp bài khi KHÔNG có questionId
          // (Backend trả submitted cho cả SubmitAnswer và SubmitExam,
          //  nhưng SubmitAnswer có questionId, SubmitExam thì không)
          if (!data.questionId && !data.QuestionId) {
            // Đóng socket ngay khi nộp bài xong (tránh reconnect loop)
            submitRequestedRef.current = false;
            clearSubmitTimeout();
            clearSubmitForceClose();
            debugLog('submitted_ack');
            monitoringService.disconnect();
            onSubmittedRef.current?.(data);
          } else {
            // Đây là response của SubmitAnswer
            console.log('Answer saved:', data);
            onAnswerSubmittedRef.current?.(data);
          }
        } else if (Array.isArray(data)) {
          console.log('Synced data received:', data);
          onSyncedRef.current?.(data);
        } else if (data.status === 'error' || data.type === 'error') {
          onErrorRef.current?.(data.message);
        }
      },
      // 2. Callback trạng thái
      (status) => {
        setConnectionState(status);
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
  }, [clearSubmitForceClose, clearSubmitTimeout, debugLog, examId, studentId, wsUrl, token]);

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
  }, [connect, debugLog]); // connect thay đổi khi wsUrl/token đổi

  // Các hàm tiện ích gửi lên server
  const syncAnswer = useCallback(
    (questionId: number, order: number, answer: any) => {
      monitoringService.send({
        Action: 'SubmitAnswer',
        Order: order,
        QuestionId: questionId,
        Answer: answer
      });

      // Fallback lưu local
      try {
        localStorage.setItem(
          `exam_${examId}_q_${questionId}`,
          JSON.stringify(answer)
        );
      } catch {}
    },
    [examId]
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
  }, [clearSubmitForceClose, clearSubmitTimeout, debugLog]);

  return {
    connectionState,
    syncAnswer,
    submitExam
  };
};
