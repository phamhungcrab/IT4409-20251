/**
 * Countdown timer component.
 *
 * Displays the remaining time until a specified end time.  Accepts an
 * ISO8601 date/time string, Date instance or epoch value for `endTime` and
 * an optional callback `onExpire` invoked when the countdown reaches zero.
 * Internally, it updates once per second.  If you have many timers on a
 * page, consider using a central timer context or hook to avoid excessive
 * intervals.
 */

import React, { useEffect, useState } from 'react';

export interface TimerProps {
  /**
   * The end time of the countdown.  Can be a Date object, an ISO string or
   * a Unix timestamp in milliseconds.
   */
  endTime: Date | string | number;
  /**
   * Optional callback fired when the countdown reaches zero.
   */
  onExpire?: () => void;
}

const Timer: React.FC<TimerProps> = ({ endTime, onExpire }) => {
  // Helper to normalize the endTime into a timestamp (ms)
  const toTimestamp = (value: Date | string | number): number => {
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') return new Date(value).getTime();
    return value;
  };
  const target = toTimestamp(endTime);

  const [timeLeft, setTimeLeft] = useState<number>(Math.max(target - Date.now(), 0));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(target - Date.now(), 0);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        // Invoke callback when timer expires
        if (onExpire) onExpire();
      }
    }, 1000);
    // Cleanup interval on unmount or when target changes
    return () => clearInterval(interval);
  }, [target, onExpire]);

  // Convert milliseconds to minutes and seconds for display
  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  // Format with leading zeros (e.g. 02:05)
  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <span className="font-mono text-lg">
      {format(minutes)}:{format(seconds)}
    </span>
  );
};

export default Timer;