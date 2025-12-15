import { useState, useEffect, useRef } from 'react';

/**
 * useTimer
 * - Giữ đồng hồ đếm ngược, có thể khôi phục sau khi F5 bằng cách lưu thời điểm bắt đầu vào sessionStorage.
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

  // Khi duration thay đổi (load lại từ server), tính lại thời gian còn lại dựa trên mốc start cũ
  useEffect(() => {
    setTimeLeft(computeInitial());
  }, [initialMinutes]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
  };
};
