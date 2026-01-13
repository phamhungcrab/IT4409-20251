# Security Policy

## Supported Versions

Các phiên bản hiện đang được hỗ trợ cập nhật bảo mật:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Nếu bạn phát hiện lỗ hổng bảo mật trong dự án **Online Exam**, vui lòng:

1. **KHÔNG** công khai lỗ hổng trên Issues hoặc các kênh công cộng
2. Gửi email đến: **myshine2k5@gmail.com** với tiêu đề `[SECURITY] <mô tả ngắn>`
3. Bao gồm các thông tin sau:
   - Mô tả chi tiết lỗ hổng
   - Các bước tái hiện (nếu có)
   - Phiên bản bị ảnh hưởng
   - Mức độ nghiêm trọng (Critical/High/Medium/Low)

### Thời gian phản hồi

- **Xác nhận nhận được**: trong vòng 48 giờ
- **Đánh giá ban đầu**: trong vòng 7 ngày
- **Vá lỗi**: tùy thuộc mức độ nghiêm trọng (thường 7-30 ngày)

### Phạm vi bảo mật

Các lỗ hổng được quan tâm bao gồm:
- SQL Injection
- Cross-Site Scripting (XSS)
- Lộ thông tin nhạy cảm (API keys, credentials)
- Bypass authentication/authorization
- Lỗ hổng trong hệ thống WebSocket/Proctoring

## Lưu ý cho Developers

- Không commit các file `.env`, secrets, hoặc API keys
- Sử dụng parameterized queries để tránh SQL Injection
- Validate và sanitize tất cả input từ người dùng
- Sử dụng HTTPS trong môi trường production
