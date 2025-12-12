/**
 * Các hàm helper để định dạng (format) dữ liệu hiển thị ra giao diện.
 *
 * Mục đích:
 *  - Chuyển đổi Date, điểm số, thời gian... sang chuỗi (string) dễ đọc cho người dùng.
 */

// Hàm định dạng ngày giờ (Date hoặc chuỗi ISO) thành chuỗi theo locale (ngôn ngữ/vùng).
export function formatDate(value: Date | string, locale = 'en-US'): string {
  /**
   * Nếu value là instance của Date (đối tượng Date thật),
   *  - dùng luôn value.
   * Nếu value là chuỗi (string), ví dụ '2025-12-12T10:30:00Z',
   *  - tạo đối tượng Date mới từ chuỗi đó: new Date(value).
   */
  const date = value instanceof Date ? value : new Date(value);

  /**
   * date.toLocaleDateString(locale, options):
   *  - Chuyển Date thành chuỗi theo ngôn ngữ/vùng được chỉ định.
   *  - locale:
   *      + 'en-US'  : tiếng Anh (Mỹ)
   *      + 'vi-VN'  : tiếng Việt
   *  - options:
   *      + year : 'numeric'  -> năm đầy đủ (ví dụ 2025)
   *      + month: 'short'    -> tháng dạng rút gọn (Jan, Feb,...). Nếu muốn kiểu số, dùng '2-digit'.
   *      + day  : 'numeric'  -> ngày trong tháng
   *      + hour : '2-digit'  -> giờ 2 chữ số (ví dụ 09, 18)
   *      + minute: '2-digit' -> phút 2 chữ số
   *
   * Kết quả là một chuỗi chứa cả ngày và giờ, ví dụ (với en-US):
   *  "Dec 12, 2025, 09:30 AM"
   */
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Hàm định dạng điểm số (số) thành chuỗi với số chữ số thập phân cố định.
export function formatScore(score: number, fractionDigits = 2): string {
  /**
   * score.toFixed(fractionDigits):
   *  - Là hàm của Number trong JS.
   *  - Chuyển số thành string, với số chữ số sau dấu phẩy cố định.
   *
   * Ví dụ:
   *  - score = 8      , fractionDigits = 2 -> "8.00"
   *  - score = 7.45678, fractionDigits = 2 -> "7.46" (tự làm tròn)
   */
  return score.toFixed(fractionDigits);
}

// Hàm định dạng thời gian (tính theo giây) thành chuỗi dạng mm:ss hoặc hh:mm:ss.
// Thường dùng cho đếm ngược (countdown) hoặc hiển thị thời lượng.
// Ở đây giả định đầu vào (seconds) luôn là số giây.
export function formatTime(seconds: number): string {
  // Tính số giờ bằng cách chia 3600 (1 giờ = 3600 giây) và lấy phần nguyên
  const h = Math.floor(seconds / 3600);

  // Tính số phút còn lại: phần dư sau khi trừ giờ, rồi chia 60 và lấy phần nguyên
  const m = Math.floor((seconds % 3600) / 60);

  // Số giây còn lại sau khi đã trừ giờ và phút
  const s = seconds % 60;

  // Chuyển phút và giây thành chuỗi, luôn đủ 2 ký tự (thêm '0' ở bên trái nếu cần)
  // Ví dụ: 5 -> "05", 12 -> "12"
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');

  // Nếu có ít nhất 1 giờ -> hiển thị dạng "hh:mm:ss"
  if (h > 0) {
    const hStr = h.toString().padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}`;
  }

  // Nếu không có giờ (h = 0) -> chỉ hiển thị "mm:ss"
  return `${mStr}:${sStr}`;
}
