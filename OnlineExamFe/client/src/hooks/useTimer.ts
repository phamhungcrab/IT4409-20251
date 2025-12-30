import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTimer
 * - Giữ đồng hồ đếm ngược, có thể khôi phục sau khi F5 bằng cách lưu thời điểm bắt đầu vào sessionStorage.
 * - Hỗ trợ đồng bộ thời gian từ Backend qua setRemainingTime.
 */
export const useTimer = (
  initialMinutes: number,
  onExpire?: () => void,
  storageKey?: string
) => {
  const computeInitial = () => {
    if (!storageKey) return initialMinutes * 60;

    const now = Date.now();
    const stored = sessionStorage.getItem(storageKey);
    let startedAt = stored ? Number(stored) : now;

    if (!stored) {
      sessionStorage.setItem(storageKey, String(startedAt));
    }

    const elapsed = Math.floor((now - startedAt) / 1000);
    const remaining = initialMinutes * 60 - elapsed;
    return remaining > 0 ? remaining : 0;
  };

  const [timeLeft, setTimeLeft] = useState(computeInitial);
  const expiredRef = useRef(false);

  // Flag để biết có đang dùng sync từ BE hay không
  const usingSyncRef = useRef(false);

  // Khi duration thay đổi (load lại từ server), tính lại thời gian còn lại dựa trên mốc start cũ
  useEffect(() => {
    // Chỉ tính lại nếu chưa dùng sync từ BE
    if (!usingSyncRef.current) {
      setTimeLeft(computeInitial());
    }
  }, [initialMinutes]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }

    // Nếu đang sync từ BE thì không cần interval local (BE gửi mỗi giây)
    if (usingSyncRef.current) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onExpire]);

  /**
   * setRemainingTime: Cho phép cập nhật thời gian từ bên ngoài (từ WebSocket).
   * Khi gọi hàm này, timer sẽ chuyển sang chế độ sync từ BE.
   */
  const setRemainingTime = useCallback((seconds: number) => {
    usingSyncRef.current = true; // Đánh dấu đang dùng sync từ BE
    setTimeLeft(seconds > 0 ? seconds : 0);

    // Kiểm tra hết giờ
    if (seconds <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
    }
  }, [onExpire]);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');

    if (h > 0) return `${hh}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    setRemainingTime, // NEW: Cho phép cập nhật từ WebSocket
  };
};
