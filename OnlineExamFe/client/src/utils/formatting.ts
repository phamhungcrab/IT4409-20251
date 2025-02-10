/**
 * Formatting helpers.
 */

// Format a Date or ISO string into a locale-aware string.
export function formatDate(value: Date | string, locale = 'en-US'): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format a numeric score with a fixed number of decimal places.
export function formatScore(score: number, fractionDigits = 2): string {
  return score.toFixed(fractionDigits);
}

// Format time in minutes to mm:ss or hh:mm:ss
// Input is usually seconds for countdowns, or minutes for duration.
// Let's assume input is seconds for general utility.
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');

  if (h > 0) {
    const hStr = h.toString().padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}`;
  }

  return `${mStr}:${sStr}`;
}