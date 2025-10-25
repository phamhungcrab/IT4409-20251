/**
 * Formatting helpers.
 *
 * Provides utility functions to format dates, numbers and durations for
 * display in the UI.  Centralising these helpers ensures consistent
 * formatting across the application and makes it easier to localise
 * formatting behaviour in the future.
 */

// Format a Date or ISO string into a locale-aware string.  If a
// locale is not provided, the browser's default locale is used.
export function formatDate(value: Date | string, locale?: string, options?: Intl.DateTimeFormatOptions): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale ?? undefined, options ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Format a numeric score with a fixed number of decimal places.
export function formatScore(score: number, fractionDigits = 2): string {
  return score.toFixed(fractionDigits);
}

// Convert a duration in milliseconds into a human-readable string (e.g.
// "1h 30m" or "2m 05s").  Only include hours if the duration is
// longer than 60 minutes.
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  // Pad seconds with a leading zero for single-digit values
  parts.push(seconds.toString().padStart(2, '0') + 's');
  return parts.join(' ');
}