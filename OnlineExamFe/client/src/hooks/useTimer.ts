/**
 * useTimer hook.
 *
 * Provides a reusable countdown timer that calculates the remaining
 * time until a specified end time.  It returns the remaining time in
 * milliseconds, as well as formatted minutes and seconds, and a flag
 * indicating whether the timer has expired.  An optional callback is
 * invoked when the countdown reaches zero.  This hook complements the
 * `Timer` component but can be used independently for fine-grained
 * control or integration with other logic.
 */

import { useEffect, useState } from 'react';

export interface UseTimerOptions {
  /**
   * End time of the countdown.  Accepts a Date object, ISO string or
   * Unix timestamp (milliseconds).  The hook will normalize this
   * internally.
   */
  endTime: Date | string | number;
  /**
   * Optional callback invoked when the timer expires.
   */
  onExpire?: () => void;
  /**
   * Interval in milliseconds at which to update the timer.  Defaults to
   * 1000 (1 second).  Reducing this value increases update frequency
   * but can impact performance if many timers are running.
   */
  intervalMs?: number;
}

export interface UseTimerReturn {
  /**
   * Remaining time in milliseconds.  Zero when expired.
   */
  timeLeft: number;
  /**
   * Remaining minutes portion (floor of timeLeft/60s).
   */
  minutes: number;
  /**
   * Remaining seconds portion (0-59).
   */
  seconds: number;
  /**
   * Whether the timer has reached zero.
   */
  isExpired: boolean;
}

const toTimestamp = (value: Date | string | number): number => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') return new Date(value).getTime();
  return value;
};

export default function useTimer({ endTime, onExpire, intervalMs = 1000 }: UseTimerOptions): UseTimerReturn {
  const target = toTimestamp(endTime);
  const [timeLeft, setTimeLeft] = useState<number>(Math.max(target - Date.now(), 0));

  useEffect(() => {
    // Update the timer at the specified interval
    const interval = setInterval(() => {
      const remaining = Math.max(target - Date.now(), 0);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [target, intervalMs, onExpire]);

  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  return {
    timeLeft,
    minutes,
    seconds,
    isExpired: timeLeft === 0,
  };
}