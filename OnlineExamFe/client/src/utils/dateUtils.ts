/**
 * =========================
 * Date/Time Utilities
 * =========================
 * Helper functions để xử lý timezone và format date/time.
 * Backend trả UTC, frontend convert sang local time để hiển thị.
 */

/**
 * Format UTC date string sang local time (Vietnam)
 * @param utcString - ISO date string từ API (UTC)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted local time string
 */
export const formatLocalDateTime = (
  utcString: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!utcString) return '';

  const date = typeof utcString === 'string' ? new Date(utcString) : utcString;
  if (isNaN(date.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
    ...options
  };

  return date.toLocaleString('vi-VN', defaultOptions);
};

/**
 * Format chỉ ngày (dd/mm/yyyy)
 */
export const formatLocalDate = (utcString: string | Date | null | undefined): string => {
  return formatLocalDateTime(utcString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: undefined,
    minute: undefined,
  });
};

/**
 * Format chỉ giờ (HH:mm)
 */
export const formatLocalTime = (utcString: string | Date | null | undefined): string => {
  return formatLocalDateTime(utcString, {
    year: undefined,
    month: undefined,
    day: undefined,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Format ngày giờ ngắn gọn (dd/mm HH:mm)
 */
export const formatShortDateTime = (utcString: string | Date | null | undefined): string => {
  return formatLocalDateTime(utcString, {
    year: undefined,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Format relative time (vd: "2 phút trước", "trong 1 giờ")
 */
export const formatRelativeTime = (utcString: string | Date | null | undefined): string => {
  if (!utcString) return '';

  const date = typeof utcString === 'string' ? new Date(utcString) : utcString;
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  const isFuture = diff > 0;
  const prefix = isFuture ? 'trong ' : '';
  const suffix = isFuture ? '' : ' trước';

  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${prefix}${minutes} phút${suffix}`;
  if (hours < 24) return `${prefix}${hours} giờ${suffix}`;
  return `${prefix}${days} ngày${suffix}`;
};

/**
 * Convert local datetime-local input value sang UTC ISO string để gửi API
 * @param localDateTimeValue - Value từ input type="datetime-local" (YYYY-MM-DDTHH:mm)
 * @returns UTC ISO string
 */
export const localToUtcString = (localDateTimeValue: string): string => {
  if (!localDateTimeValue) return '';
  const date = new Date(localDateTimeValue);
  return date.toISOString();
};

/**
 * Convert UTC ISO string sang datetime-local format để hiển thị trong input
 * @param utcString - ISO date string từ API (UTC)
 * @returns Local datetime string format YYYY-MM-DDTHH:mm
 */
export const utcToLocalInputValue = (utcString: string | null | undefined): string => {
  if (!utcString) return '';

  const date = new Date(utcString);
  if (isNaN(date.getTime())) return '';

  // Get local components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
