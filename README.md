# Hướng Dẫn Cài Đặt và Sử Dụng Hệ Thống Thi Trực Tuyến (Online Exam System)

Chào mừng bạn đến với dự án Hệ thống Thi Trực Tuyến. Tài liệu này sẽ hướng dẫn bạn chi tiết từ A-Z cách cài đặt, cấu hình và chạy dự án, cũng như giải thích về cấu trúc và công nghệ được sử dụng.

---

## 1. Giới Thiệu Đề Tài
Đây là một ứng dụng web cho phép tổ chức và quản lý các kỳ thi trực tuyến. Hệ thống hỗ trợ nhiều vai trò người dùng (Sinh viên, Giáo viên, Quản trị viên), cho phép tạo đề thi, làm bài thi trong thời gian thực, tự động chấm điểm và xem kết quả.

---

## 2. Công Nghệ Sử Dụng

### Backend (Server)
- **Ngôn ngữ**: C# (.NET 8.0)
- **Framework**: ASP.NET Core Web API
- **Database**: SQL Server
- **ORM**: Entity Framework Core (Code First)
- **Real-time**: WebSocket (SignalR hoặc native WebSocket)
- **Authentication**: JWT (JSON Web Token)

### Frontend (Client)
- **Framework**: React (sử dụng Vite để build)
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Internationalization**: react-i18next (Đa ngôn ngữ Anh/Việt)

---

## 3. Chức Năng Hiện Tại

- **Xác thực & Phân quyền**:
  - Đăng nhập, Đăng xuất.
  - Tự động làm mới token (Refresh Token) giúp duy trì phiên đăng nhập.
  - Phân quyền truy cập dựa trên vai trò (Admin, Teacher, Student).
- **Quản lý Đề thi**:
  - Xem danh sách đề thi.
  - Hiển thị trạng thái bài thi (Chưa bắt đầu, Đang diễn ra, Đã kết thúc).
- **Làm bài thi (Exam Room)**:
  - Vào phòng thi với giao diện thời gian thực.
  - Đồng hồ đếm ngược (Timer).
  - Đồng bộ câu trả lời liên tục (tránh mất bài khi tải lại trang).
  - Nộp bài và nhận kết quả ngay lập tức.
- **Xem kết quả**:
  - Sinh viên xem lịch sử điểm thi.
  - Xem chi tiết bài làm.
- **Quản trị (Admin Dashboard)**:
  - Xem danh sách toàn bộ đề thi.
  - Quản lý thông báo hệ thống.
- **Đa ngôn ngữ**: Chuyển đổi linh hoạt giữa Tiếng Việt và Tiếng Anh.

---

## 4. Ý Nghĩa Cấu Trúc Thư Mục

### Backend (`OnlineExamBe`)
- **`OnlineExam.Domain`**: Chứa các thực thể (Entities) mapping với Database (ví dụ: `User`, `Exam`, `Question`). Đây là "lõi" của dữ liệu.
- **`OnlineExam.Application`**: Chứa logic nghiệp vụ (Services) và các DTO (Data Transfer Objects) để trao đổi dữ liệu.
  - `Services/`: Xử lý logic như `AuthService` (đăng nhập), `ExamService` (xử lý thi).
  - `Interfaces/`: Định nghĩa các hàm mà Service phải thực hiện.
- **`OnlineExam.Infrastructure`**: Chứa cấu hình Database (`DbContext`) và Repositories (lớp truy xuất dữ liệu).
- **`OnlineExam` (API)**:
  - `Controllers/`: Nơi nhận request từ Frontend (ví dụ: `AuthController`, `ExamController`).
  - `appsettings.json`: Chứa cấu hình kết nối Database.
  - `Program.cs`: File khởi chạy server.

### Frontend (`OnlineExamFe/client`)
- **`src/components`**: Các thành phần giao diện tái sử dụng (ví dụ: `Layout`, `Sidebar`, `AnnouncementBanner`).
- **`src/pages`**: Các màn hình chính (ví dụ: `LoginPage`, `ExamRoomPage`, `ResultsPage`).
- **`src/services`**: Các hàm gọi API xuống Backend (ví dụ: `authService`, `examService`).
- **`src/hooks`**: Các logic dùng chung (ví dụ: `useAuth` để lấy thông tin user, `useExam` để xử lý socket).
- **`src/utils`**: Các hàm tiện ích (ví dụ: `apiClient` để cấu hình axios, `formatting` để định dạng ngày tháng).
- **`src/i18n`**: File dịch ngôn ngữ (`en.json`, `vi.json`).

---

## 5. Hướng Dẫn Cài Đặt & Chạy (Từ A-Z)

### Bước 1: Chuẩn bị môi trường
Hãy chắc chắn bạn đã cài đặt:
1. **.NET SDK 8.0**: [Tải tại đây](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **Node.js** (v16 trở lên): [Tải tại đây](https://nodejs.org/)
3. **SQL Server** (hoặc SQL Server Express): [Tải tại đây](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
4. **SQL Server Management Studio (SSMS)**: Để quản lý database.

### Lưu ý cho người dùng Windows
Các lệnh trong tài liệu này (như `cd`, `dotnet`, `npm`) hoạt động tốt trên cả **Windows (PowerShell/CMD)** và Linux/macOS.
- **Bash** là shell mặc định của Linux, nhưng các lệnh cơ bản trong hướng dẫn này tương thích với Windows.
- Nếu bạn dùng PowerShell, bạn có thể copy paste trực tiếp các lệnh bên dưới.

### Bước 2: Cấu hình Database (Backend)
Mặc định, `appsettings.Development.json` có thể đang trỏ đến một **Server Online**. Để chạy ổn định và tiết kiệm chi phí, bạn nên kết nối với **SQL Server Local** trên máy của mình.

**Cách kết nối SQL Server Local:**
1. Đảm bảo đã cài **SQL Server** (bản Developer hoặc Express) và **SSMS**.
2. Mở file `OnlineExamBe/OnlineExam/appsettings.Development.json`.
3. Tìm phần `ConnectionStrings` và sửa lại `DefaultConnection` như sau:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=OnlineExamDb;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```
   *Lưu ý: Nếu bạn dùng SQL Express, phần Server thường là `.\\SQLEXPRESS` hoặc `localhost\\SQLEXPRESS`.*

4. **Khởi tạo Database (Code First):**
   Dự án này không dùng file `.sql` truyền thống mà dùng **Entity Framework Migrations**. Bạn chỉ cần chạy lệnh sau để tự động tạo database và bảng:

   Mở Terminal tại thư mục `OnlineExamBe/OnlineExam` và chạy:
   ```powershell
   dotnet ef database update
   ```
   *(Lệnh này sẽ quét thư mục Migrations và áp dụng cấu trúc xuống SQL Server của bạn).*

### Bước 3: Chạy Backend
1. Tại thư mục `OnlineExamBe/OnlineExam`, chạy lệnh:
   ```bash
   dotnet run
   ```
2. Nếu thành công, bạn sẽ thấy thông báo server đang lắng nghe (thường là `http://localhost:5000` hoặc `https://localhost:7000`).

### Bước 4: Chạy Frontend
1. Mở một Terminal mới.
2. Di chuyển vào thư mục Frontend:
   ```bash
   cd OnlineExamFe/client
   ```
3. Cài đặt các thư viện (chỉ cần làm lần đầu):
   ```bash
   npm install
   ```
4. Chạy ứng dụng:
   ```bash
   npm run dev
   ```
5. Truy cập địa chỉ hiện ra trên màn hình (thường là `http://localhost:5173`) bằng trình duyệt.

---

## 6. Mong Muốn Mở Rộng Sau Này (Future Work)
- **Giám sát thi thông minh (AI Proctoring)**: Tự động phát hiện gian lận qua webcam.
- **Ngân hàng câu hỏi phong phú**: Hỗ trợ kéo thả, điền từ, code trực tiếp.
- **Thống kê chi tiết**: Biểu đồ phân tích phổ điểm, đánh giá năng lực học sinh.
- **Chat thời gian thực**: Hỗ trợ trực tuyến giữa giám thị và thí sinh.
- **Mobile App**: Phiên bản ứng dụng cho điện thoại.

---
*Tài liệu được tạo tự động bởi trợ lý AI.*
