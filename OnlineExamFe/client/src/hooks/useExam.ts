import { useEffect, useRef, useState, useCallback } from 'react';
import { monitoringService } from '../services/monitoringService';

interface UseExamProps {
  wsUrl: string;
  studentId: number;
  examId: number;
  onTimeSync?: (remainingSeconds: number) => void;
  onSynced?: (data: any) => void;
  onSubmitted?: (result?: any) => void;
  onError?: (msg: string) => void;
}

export const useExam = ({
  wsUrl,
  studentId,
  examId,
  onSynced,
  onSubmitted,
  onError,
  onTimeSync,
}: UseExamProps) => {
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  >('disconnected');

  // Ref giữ hàm để tránh re-declared function khi dependency thay đổi
  const onTimeSyncRef = useRef(onTimeSync);
  const onSyncedRef = useRef(onSynced);
  const onSubmittedRef = useRef(onSubmitted);
  const onErrorRef = useRef(onError);

  // Heartbeat interval
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs
  useEffect(() => {
    onTimeSyncRef.current = onTimeSync;
    onSyncedRef.current = onSynced;
    onSubmittedRef.current = onSubmitted;
    onErrorRef.current = onError;
  }, [onTimeSync, onSynced, onSubmitted, onError]);

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
            onSubmittedRef.current?.(data);
          } else {
            // Đây là response của SubmitAnswer, không làm gì
            console.log('Answer saved:', data);
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
  }, [wsUrl, token]);

  // Effect khởi tạo kết nối
  useEffect(() => {
    connect();

    // Cleanup khi unmount
    return () => {
      monitoringService.disconnect();
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [connect]); // connect thay đổi khi wsUrl/token đổi

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
    monitoringService.send({ Action: 'SubmitExam' });
  }, []);

  return {
    connectionState,
    syncAnswer,
    submitExam
  };
};
