# HƯỚNG DẪN TEST LOCAL (LOCAL VERIFICATION CHECKLIST)
Hệ thống OnlineExam hiện đã chạy flow thi cơ bản. Dưới đây là checklist để bạn tự verify tính năng end-to-end trên máy local.

## 1. Chuẩn bị (Setup)
*   **Database**:
    *   Đảm bảo MySQL đang chạy và đã seed dữ liệu (Users, Classes, Blueprints).
    *   User mẫu: `student1` (pass: `123456`), `teacher1` (pass: `123456`), `admin` (nếu có).
*   **Backend**:
    *   Chạy `dotnet run` trong thư mục `OnlineExamBe/OnlineExam`.
    *   URL: `https://localhost:7239` (hoặc port tương ứng).
*   **Frontend**:
    *   Chạy `npm run dev` trong thư mục `OnlineExamFe/client`.
    *   URL: `http://localhost:5173`.

## 2. Kiểm thử luồng Student (Student Flow)
Flow này kiểm tra khả năng vào thi, làm bài và kết nối WebSocket.

*   [ ] **Login Student**:
    *   Đăng nhập với Role: **Student**.
    *   Kết quả mong đợi: Vào được `StudentDashboard`. Thấy danh sách "Upcoming Exams" và Banner.
*   [ ] **Load Exams**:
    *   Kiểm tra danh sách bài thi.
    *   Kết quả mong đợi: Thấy các bài thi được gán cho sinh viên (nếu có). Ngày giờ hiển thị đúng.
*   [ ] **Start Exam**:
    *   Click nút "Enter" hoặc "Start" ở bài thi sắp tới.
    *   Kết quả mong đợi:
        *   Chuyển sang trang `ExamRoomPage` (`/exam/:id`).
        *   Thấy thông báo "Connected" (màu xanh) ở góc trên.
        *   Hiển thị câu hỏi đầu tiên.
        *   Đồng hồ đếm ngược bắt đầu chạy.
*   [ ] **Answer Sync (WebSocket)**:
    *   Chọn một đáp án bất kỳ.
    *   Mở Console (F12), kiểm tra log.
    *   Kết quả mong đợi: Thấy log "Synced" hoặc không báo lỗi đỏ. Server đã nhận đáp án.
*   [ ] **Resume (F5/Refresh)**:
    *   Nhấn F5 để tải lại trang khi đang làm bài.
    *   Kết quả mong đợi:
        *   Vẫn ở trong phòng thi.
        *   Trạng thái WebSocket kết nối lại ("Connected").
        *   Các đáp án đã chọn trước đó được hiển thị lại (Hydrate success).
*   [ ] **Submit Exam**:
    *   Click "Submit Exam" -> Confirm.
    *   Kết quả mong đợi:
        *   Alert thông báo điểm số (nếu backend trả về ngay).
        *   Chuyển hướng sang trang Results.
        *   Thấy kết quả bài thi vừa làm trong bảng Results.

## 3. Kiểm thử luồng Teacher (Teacher Flow)
Flow này kiểm tra khả năng quản lý lớp và tạo bài thi.

*   [ ] **Login Teacher**:
    *   Đăng nhập với Role: **Teacher**.
    *   Kết quả mong đợi: Vào được `TeacherDashboard`. Thấy danh sách lớp phụ trách.
*   [ ] **View Students**:
    *   Click "View Users" ở một lớp bất kỳ.
    *   Kết quả mong đợi: Bảng bên phải hiện danh sách sinh viên của lớp đó.
*   [ ] **Create Exam**:
    *   Click "+ Create Exam".
    *   Nhập tên bài thi, thời lượng (60), Blueprint ID (1).
    *   Kết quả mong đợi:
        *   Thông báo "Tạo bài thi thành công".
        *   Bài thi mới hiện ngay trong danh sách Exams bên dưới.
*   [ ] **Verify by Student**:
    *   Logout Teacher -> Login lại Student (thuộc lớp đó).
    *   Kết quả mong đợi: Thấy bài thi vừa tạo xuất hiện trong danh sách "Upcoming Exams".

## 4. Kiểm thử Admin (Admin Flow)
*   [ ] **Login Admin**:
    *   Đăng nhập với Role: **Admin**.
    *   Kết quả mong đợi: Vào `AdminPage`. Thấy danh sách tất cả bài thi.
*   [ ] **Check UI**:
    *   Kiểm tra bảng Exams hiển thị đúng cột (Name, Duration, Start Time).
    *   Các nút Create/Edit/Delete bị disable (xám) và có tooltip "Coming Soon".

## Notes
*   Nếu gặp lỗi WebSocket (mất kết nối liên tục): Kiểm tra lại `wsUrl` trong `network tab`.
*   Nếu không thấy Exam vừa tạo: Kiểm tra xem Student có đúng là thuộc Class mà Teacher vừa tạo Exam không.
