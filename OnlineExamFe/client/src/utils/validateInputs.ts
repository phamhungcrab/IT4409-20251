/**
 * Các hàm helper để kiểm tra (validate) dữ liệu nhập từ form.
 *
 * Mục đích:
 *  - Trước khi gửi dữ liệu lên backend, FE kiểm tra nhanh dữ liệu có hợp lệ không.
 *  - Giảm lỗi đơn giản (thiếu trường, email sai định dạng, mật khẩu quá yếu,...).
 */

// Hàm kiểm tra một giá trị có "không rỗng" hay không.
export function isRequired(value: string): boolean {
  // value.trim() sẽ xóa khoảng trắng đầu và cuối chuỗi.
  // Nếu sau khi trim mà chuỗi khác rỗng => người dùng có nhập nội dung.
  return value.trim() !== '';
}

// Hàm kiểm tra email có đúng "format cơ bản" hay không bằng regex.
export function isValidEmail(email: string): boolean {
  /**
   * Giải thích regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
   *  - ^           : bắt đầu chuỗi
   *  - [^\s@]+     : 1 hoặc nhiều ký tự bất kỳ, trừ khoảng trắng và ký tự '@'
   *  - @           : bắt buộc có ký tự '@'
   *  - [^\s@]+     : 1 hoặc nhiều ký tự nữa, trừ khoảng trắng và '@' (phần domain trước dấu chấm)
   *  - \.          : ký tự dấu chấm '.' (cần escape vì '.' trong regex là ký tự đặc biệt)
   *  - [^\s@]{2,}  : ít nhất 2 ký tự không phải khoảng trắng và '@' (phần đuôi: com, vn, edu,...)
   *  - $           : kết thúc chuỗi
   *
   * Đây là kiểm tra "vừa đủ" cho email, không phải 100% theo chuẩn RFC nhưng đủ dùng cho form cơ bản.
   */
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return pattern.test(email);
} 

// Hàm kiểm tra mật khẩu có đủ "độ mạnh tối thiểu" hay không.
// Yêu cầu ví dụ:
//  - Ít nhất 8 ký tự
//  - Có ít nhất 1 chữ hoa (A-Z)
//  - Có ít nhất 1 chữ thường (a-z)
//  - Có ít nhất 1 chữ số (0-9)
export function isValidPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password); // Có ký tự in hoa?
  const hasLowerCase = /[a-z]/.test(password); // Có ký tự thường?
  const hasNumber = /[0-9]/.test(password);    // Có số?

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber
  );
}

// Hàm kiểm tra số lượng lựa chọn trong câu hỏi dạng multi-choice (chọn nhiều)
// - selection: mảng các đáp án được chọn (vd: [1, 3] nghĩa là chọn đáp án 1 và 3)
// - min      : số lượng tối thiểu cần chọn (mặc định = 1)
export function isValidSelection(selection: number[], min = 1): boolean {
  // Nếu số phần tử trong mảng >= min -> hợp lệ
  return selection.length >= min;
}
