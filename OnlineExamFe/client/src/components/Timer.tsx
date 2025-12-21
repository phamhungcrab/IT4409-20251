/**
 * ---- Chưa dùng tới
 * Timer (đếm ngược): Component hiển thị thời gian còn lại đến một mốc kết thúc.
 *
 * Ý tưởng:
 * - Bạn truyền vào `endTime` (thời điểm kết thúc).
 * - Component sẽ tính ra còn bao nhiêu mili-giây từ “bây giờ” đến endTime.
 * - Mỗi 1 giây, component cập nhật lại thời gian còn lại.
 * - Khi về 0 thì gọi callback `onExpire` (nếu có).
 *
 * Dùng trong hệ thống thi:
 * - endTime có thể là thời điểm kết thúc bài thi (startTime + duration).
 * - Khi hết giờ thì tự động nộp bài.
 */

import React, { useEffect, useState } from 'react';

export interface TimerProps {
  /**
   * endTime: thời điểm kết thúc đếm ngược.
   *
   * Bạn cho phép nhiều kiểu để tiện dùng:
   * - Date: new Date(...)
   * - string: chuỗi ISO (vd: "2025-12-16T10:30:00Z")
   * - number: timestamp mili-giây (vd: Date.now() + 60_000)
   */
  endTime: Date | string | number;

  /**
   * onExpire: hàm tuỳ chọn.
   * Được gọi khi timer đếm về 0.
   * Ví dụ: hết giờ thì gọi submitExam().
   */
  onExpire?: () => void;
}

const Timer: React.FC<TimerProps> = ({ endTime, onExpire }) => {
  /**
   * Hàm phụ trợ: chuẩn hoá endTime về dạng timestamp (mili-giây).
   *
   * Vì endTime có thể là Date / string / number nên ta cần quy về 1 kiểu chung.
   * - Date -> getTime()
   * - string -> new Date(string).getTime()
   * - number -> dùng luôn (giả sử số đó là ms)
   */
  const toTimestamp = (value: Date | string | number): number => {
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') return new Date(value).getTime();
    return value;
  };

  // target là mốc thời gian kết thúc (ms)
  const target = toTimestamp(endTime);

  /**
   * timeLeft là số mili-giây còn lại.
   * Khởi tạo bằng max(target - now, 0) để tránh âm.
   *
   * Lưu ý:
   * - useState(...) chỉ chạy giá trị khởi tạo khi component mount lần đầu.
   * - Sau đó, timeLeft chỉ đổi khi setTimeLeft(...)
   */
  const [timeLeft, setTimeLeft] = useState<number>(Math.max(target - Date.now(), 0));

  /**
   * useEffect để tạo vòng lặp setInterval.
   *
   * - Mỗi 1000ms (1 giây), ta tính remaining và setTimeLeft.
   * - Nếu remaining <= 0:
   *    + clearInterval để dừng (đỡ chạy mãi)
   *    + gọi onExpire() nếu có
   *
   * Cleanup:
   * - return () => clearInterval(interval)
   * - Đây là “dọn dẹp” khi component bị unmount hoặc khi dependencies thay đổi.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(target - Date.now(), 0);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);

        // Nếu có callback thì gọi để báo “hết giờ”
        if (onExpire) onExpire();
      }
    }, 1000);

    // Cleanup: dọn interval khi component biến mất hoặc target đổi
    return () => clearInterval(interval);
  }, [target, onExpire]);

  /**
   * Chuyển timeLeft (ms) -> phút và giây để hiển thị.
   *
   * - timeLeft / 1000 => giây
   * - / 60 => phút
   */
  /**
   * Tính toán giờ, phút, giây từ tổng mili-giây (timeLeft)
   */
  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  /**
   * format số thành 2 chữ số:
   * 2 -> "02", 12 -> "12"
   * dùng padStart(2,'0')
   */
  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <span className="font-mono text-lg px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sky-100 shadow-sm">
      {/* Chỉ hiện giờ nếu hours > 0 */}
      {hours > 0 ? '${format(hours)}:' : ''}
      {format(minutes)}:{format(seconds)}
    </span>
  );
};

export default Timer;
