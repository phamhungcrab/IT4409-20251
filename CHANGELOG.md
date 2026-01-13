# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-13

### Added

#### Core Features
- **Hệ thống thi trực tuyến** hoàn chỉnh cho 3 vai trò: Sinh viên, Giảng viên, Admin
- **Real-time WebSocket sync** đáp án với cơ chế offline queue và auto-reconnect
- **Timer đếm ngược** với cảnh báo 5p/3p/1p và tự động nộp khi hết giờ
- **Blueprint đề thi** theo chương và độ khó
- **Import câu hỏi** từ JSON cho admin

#### Student Features
- Xem danh sách bài thi theo lớp (trạng thái, thời lượng, lịch thi)
- Làm bài với điều hướng câu hỏi nhanh
- Auto-save đáp án qua WebSocket
- Khôi phục phiên làm bài khi refresh/đổi thiết bị
- Xem kết quả chi tiết từng câu (đáp án đúng/sai, điểm)

#### Teacher Features
- Quản lý lớp học được phân công
- Tạo/sửa/xóa blueprint và kỳ thi
- Theo dõi trạng thái làm bài sinh viên real-time
- Force submit bài thi khi cần
- Xem điểm tổng hợp theo kỳ thi

#### Admin Features
- Quản lý tài khoản (CRUD, import danh sách)
- Quản lý môn học, lớp học
- Phân công giảng viên
- Quản lý ngân hàng câu hỏi

#### Security & Anti-Cheat
- Session-based authentication với HttpOnly cookie
- Phân quyền theo role và permission code
- **Focus loss detection** - phát hiện tab out > 7s
- **Fullscreen enforcement** - bắt buộc chế độ toàn màn hình
- **Duplicate session blocking** - chặn thi hộ bằng kiểm tra WS trước khi load đề
- Chặn copy/paste, right-click, DevTools trong phòng thi
- Rate limiting để chống brute-force

#### UI/UX
- Responsive design với Tailwind CSS
- Dark theme mặc định
- Đa ngôn ngữ (i18n) - Tiếng Việt/English
- Toast notifications cho các sự kiện quan trọng
- Loading states và error handling toàn diện

### Technical Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router, i18next
- **Backend**: ASP.NET Core 8, Entity Framework Core, SQL Server
- **Real-time**: WebSocket (native)
- **Deployment**: Vercel (FE), Render (BE)

---

## [Unreleased]

### Planned
- AI proctoring: nhận diện khuôn mặt, phát hiện rời màn hình
- AI tạo câu hỏi theo mục tiêu học tập
- Chấm tự luận bán tự động
- Adaptive testing theo năng lực người làm
- Dashboard phân tích sâu

[1.0.0]: https://github.com/phamhungcrab/IT4409-20251/releases/tag/v1.0.0
[Unreleased]: https://github.com/phamhungcrab/IT4409-20251/compare/v1.0.0...HEAD
