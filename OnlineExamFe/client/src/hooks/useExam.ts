import { useEffect, useRef, useState, useCallback } from 'react';
import { monitoringService } from '../services/monitoringService';

/**
 * UseExamProps: các tham số đầu vào để hook điều khiển “phòng thi” (WS).
 *
 * - wsUrl: URL WebSocket (vd: wss://.../ws?examId=...&studentId=...)
 * - studentId, examId: định danh người thi + bài thi (dùng để lưu localStorage key, debug,...)
 * - onSynced: callback khi server gửi lại danh sách câu trả lời đã lưu (sync state)
 * - onSubmitted: callback khi server báo đã nộp bài + trả kết quả
 * - onError: callback khi có lỗi
 */
interface UseExamProps {
  wsUrl: string;
  studentId: number;
  examId: number;
  onSynced?: (answers?: any) => void;
  onSubmitted?: (result: any) => void;
  onError?: (error: string) => void;
  onTimeSync?: (remainingSeconds: number) => void;
}

/**
 * useExam: custom hook quản lý WebSocket cho quá trình thi:
 * - Kết nối WS
 * - Tự reconnect nếu rớt mạng
 * - Gửi đáp án từng câu (SubmitAnswer)
 * - Gửi yêu cầu nộp bài (SubmitExam)
 * - Nhận dữ liệu sync state / submitted / error từ server
 */
export const useExam = ({
  wsUrl,
  studentId,
  examId,
  onSynced,
  onSubmitted,
  onError,
  onTimeSync, // NEW
}: UseExamProps) => {
  /**
   * wsRef: lưu đối tượng WebSocket hiện tại.
   *
   * Vì sao dùng useRef thay vì useState?
   * - WebSocket là object “mutable” (thay đổi được).
   * - Ta không cần re-render UI mỗi lần ws thay đổi.
   * - useRef giữ giá trị “xuyên suốt” giữa các lần render, nhưng thay đổi ref không gây re-render.
   */
  const wsRef = useRef<WebSocket | null>(null);

  // Ref để lưu heartbeat interval (cleanup khi đóng WS)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * connectionState: trạng thái kết nối để UI hiển thị:
   * - connecting: đang kết nối lần đầu
   * - connected: đã kết nối
   * - disconnected: đã ngắt
   * - reconnecting: đang cố kết nối lại
   */
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');

  /**
   * reconnectAttempts: số lần đã reconnect.
   * Dùng useRef để:
   * - tăng/giảm không gây re-render
   * - không bị reset khi component re-render
   */
  const reconnectAttempts = useRef(0);

  /**
   * maxReconnectAttempts: giới hạn số lần reconnect.
   * Tránh vòng lặp vô tận nếu WS url sai / server down.
   */
  const maxReconnectAttempts = 5;

  /**
   * Các ref callback:
   * Mục tiêu: tránh trường hợp callback thay đổi => connect() thay đổi => useEffect chạy lại => reconnect không cần thiết.
   *
   * Ý tưởng:
   * - connect() chỉ phụ thuộc wsUrl (để không reconnect mỗi lần parent render).
   * - nhưng vẫn dùng được callback mới nhất nhờ onXxxRef.current
   */
  const onSyncedRef = useRef(onSynced);
  const onSubmittedRef = useRef(onSubmitted);
  const onErrorRef = useRef(onError);
  const onTimeSyncRef = useRef(onTimeSync); // NEW

  /**
   * Mỗi khi props callback thay đổi, ta cập nhật ref.current.
   * - Việc cập nhật ref.current không gây re-render.
   * - Nhưng giúp WS handler luôn gọi đúng callback mới nhất.
   */
  useEffect(() => {
    onSyncedRef.current = onSynced;
    onSubmittedRef.current = onSubmitted;
    onErrorRef.current = onError;
    onTimeSyncRef.current = onTimeSync; // NEW
  }, [onSynced, onSubmitted, onError, onTimeSync]);

  /**
   * connect(): hàm tạo kết nối WebSocket.
   * useCallback để giữ reference ổn định, tránh tạo hàm mới mỗi render.
   *
   * Dependency chỉ có [wsUrl]:
   * - đổi wsUrl => reconnect theo url mới
   * - còn callback không nằm dependency vì đã dùng ref
   */
  const connect = useCallback(() => {
    // Nếu chưa có wsUrl thì không làm gì cả
    if (!wsUrl) return;

    // Nếu đang disconnected => connecting, còn nếu đang cố lại => reconnecting
    setConnectionState((prev) =>
      prev === 'disconnected' ? 'connecting' : 'reconnecting'
    );

    /**
     * Lấy token từ localStorage để gắn vào WS.
     * Thực tế backend bạn có cơ chế Session header cho HTTP,
     * WS thì bạn đang “đính kèm token vào query param session=...”.
     */
    const token = localStorage.getItem('token');

    // Nếu có token, nối thêm session=... vào wsUrl (giữ đúng dấu ? / &)
    const urlWithToken = token
      ? `${wsUrl}${wsUrl.includes('?') ? '&' : '?'}session=${encodeURIComponent(
          token
        )}`
      : wsUrl;

    /**
     * monitoringService.connect(...) là wrapper tạo WS và đăng ký onmessage chung.
     * Callback (data) là dữ liệu server gửi lên (đã parse JSON hoặc parse theo service).
     *
     * Bạn đang phân loại message:
     * - data.status === 'submitted' => server báo đã nộp
     * - Array.isArray(data) => server trả danh sách đáp án (sync state)
     * - data.type === 'error' => server báo lỗi
     */
    const ws = monitoringService.connect(urlWithToken, (data) => {
      console.log('WS Message:', data);

      // NEW: Xử lý message thời gian từ BE (số giây còn lại)
      // BE gửi dạng số hoặc chuỗi số (vd: 59 hoặc "59")
      if (typeof data === 'number') {
        onTimeSyncRef.current?.(data);
        return;
      }
      if (typeof data === 'string' && /^\d+$/.test(data.trim())) {
        onTimeSyncRef.current?.(parseInt(data.trim(), 10));
        return;
      }

      // Xử lý các message khác
      if (data.status === 'submitted') {
        onSubmittedRef.current?.(data);
      } else if (data.status === 'Heartbeat') {
        // Heartbeat ack từ BE, không cần làm gì
        console.log('Heartbeat ack received');
      } else if (Array.isArray(data)) {
        onSyncedRef.current?.(data);
      } else if (data.type === 'error' || data.status === 'error') {
        onErrorRef.current?.(data.message);
      }
    });

    /**
     * ws.onopen: chạy khi WS kết nối thành công.
     * - set connected
     * - reset số lần reconnect
     * - gửi Action SyncState để xin server trả “state đang lưu” (nếu có)
     */
    ws.onopen = () => {
      console.log('WS Connected');
      setConnectionState('connected');
      reconnectAttempts.current = 0;

      // Gửi yêu cầu đồng bộ state (server trả về danh sách đáp án đã lưu)
      ws.send(JSON.stringify({ Action: 'SyncState' }));

      // NEW: Thiết lập Heartbeat interval (gửi mỗi 30 giây)
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ Action: 'Heartbeat' }));
          console.log('Heartbeat sent');
        }
      }, 30000); // 30 giây
    };

    /**
     * ws.onclose: chạy khi WS bị đóng (mất mạng, server đóng, url sai...)
     * - set disconnected
     * - xoá wsRef
     * - thử reconnect theo cơ chế “backoff” (đợi tăng dần)
     */
    ws.onclose = () => {
      console.log('WS Closed');
      setConnectionState('disconnected');
      wsRef.current = null;

      // NEW: Cleanup heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      /**
       * Tự reconnect (Auto-reconnect):
       * - Nếu chưa vượt quá maxReconnectAttempts:
       *    + đợi một khoảng thời gian rồi connect lại
       * - Nếu vượt quá:
       *    + báo lỗi cho UI (yêu cầu refresh)
       *
       * timeout = min(1000 * 2^attempt, 10000)
       * => lần 0: 1s, lần 1: 2s, lần 2: 4s, lần 3: 8s, lần 4: 10s (cap)
       */
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current),
          10000
        );
        console.log(`Reconnecting in ${timeout}ms...`);

        setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, timeout);
      } else {
        onErrorRef.current?.('Mất kết nối. Vui lòng refresh trang.');
      }
    };

    // Lưu WS instance vào ref để các hàm khác dùng (syncAnswer, submitExam)
    wsRef.current = ws;
  }, [wsUrl]);

  /**
   * useEffect gọi connect() khi component mount.
   * Cleanup:
   * - khi component unmount hoặc wsUrl đổi làm connect() đổi => đóng WS cũ.
   *
   * Đây là cách tránh WS “rò rỉ” (leak) khi rời trang phòng thi.
   */
  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  /**
   * syncAnswer: gửi đáp án từng câu lên server.
   *
   * - Nếu WS đang OPEN => send SubmitAnswer ngay
   * - Nếu WS chưa connect => chỉ lưu localStorage để backup, chờ sync sau
   *
   * Lưu ý:
   * - Bạn đang lưu local theo key exam_{examId}_q_{questionId}
   * - Đây giúp refresh trang vẫn lấy lại đáp án (hydrate)
   */
  const syncAnswer = useCallback(
    (questionId: number, order: number, answer: any) => {
      // WebSocket.OPEN nghĩa là kết nối đang sẵn sàng gửi dữ liệu
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            Action: 'SubmitAnswer',
            Order: order,
            QuestionId: questionId,
            Answer: answer,
          })
        );

        // Backup vào localStorage
        localStorage.setItem(
          `exam_${examId}_q_${questionId}`,
          JSON.stringify(answer)
        );
      } else {
        console.warn('WS chưa kết nối, chỉ lưu localStorage');
        localStorage.setItem(
          `exam_${examId}_q_${questionId}`,
          JSON.stringify(answer)
        );
      }
    },
    [examId] // studentId không dùng trực tiếp ở đây nên không cần phụ thuộc
  );

  /**
   * submitExam: gửi lệnh nộp bài lên server.
   * - Nếu WS đang OPEN => gửi Action SubmitExam
   * - Nếu không => báo lỗi vì nộp bài cần server nhận được
   */
  const submitExam = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          Action: 'SubmitExam',
        })
      );
    } else {
      onErrorRef.current?.('Không thể nộp: mất kết nối. Hãy thử lại khi đã kết nối.');
    }
  }, []);

  /**
   * requestSync: Gửi yêu cầu SyncState để lấy lại đáp án đã lưu.
   * Dùng khi: đổi máy thi, reconnect thủ công.
   */
  const requestSync = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ Action: 'SyncState' }));
    }
  }, []);

  // Hook trả về trạng thái kết nối và các hành động
  return {
    connectionState,
    syncAnswer,
    submitExam,
    requestSync, // NEW: Cho phép gọi SyncState thủ công
  };
};
