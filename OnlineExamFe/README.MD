Tuyệt vời 👍
Dưới đây là **file `README.md` hoàn chỉnh (chuẩn GitHub)** —
viết bằng **Markdown tiếng Việt dễ hiểu**, mô tả **cách cài đặt, kết nối SQL Server Microsoft, khởi tạo database**,
**chạy backend ASP.NET Core + frontend React**, và **giải thích nhiệm vụ từng file chính** trong dự án.

---

```markdown
# 🧠 HỆ THỐNG THI TRỰC TUYẾN – ONLINE EXAMINATION SYSTEM

> **Tác giả:** Phạm Ngọc Hưng – MSSV: 20235342
> **Công nghệ:** React + ASP.NET Core Web API + SignalR + SQL Server
> **Ngày tạo:** 2025-10-26
> **Mục tiêu:** Xây dựng nền tảng thi trực tuyến full-stack hỗ trợ giám sát và chấm điểm tự động.

---

## 📘 Giới thiệu

Dự án “Online Examination System” là nền tảng web giúp:
- Tổ chức kỳ thi trực tuyến cho **giáo viên và sinh viên**.
- Quản lý người dùng, đề thi, câu hỏi, lớp học.
- Làm bài thi thời gian thực có đồng hồ **đồng bộ server (SignalR)**.
- Chấm điểm tự động, lưu log audit và giám sát phòng thi theo thời gian thực.

---

## 📂 Cấu trúc thư mục

```

online-examination-system/
├── api/                        # Backend ASP.NET Core Web API
│   ├── Controllers/            # Xử lý các yêu cầu REST (Auth, Exam, Result, ...)
│   ├── Hubs/                   # SignalR Hub cho giám sát và đồng hồ đếm ngược
│   ├── Models/                 # Entities, DTOs, Enums mô tả cấu trúc dữ liệu
│   ├── Services/               # Business logic (AuthService, ExamService, ...)
│   ├── Data/                   # DbContext, cấu hình bảng (EF Core)
│   ├── Helpers/                # Mã hóa mật khẩu, chấm điểm, random hóa đề
│   ├── Middleware/             # Xử lý ngoại lệ & ghi log Audit
│   ├── Program.cs              # Điểm khởi chạy Web API
│   ├── appsettings.json        # Cấu hình kết nối Database
│   └── api.csproj
│
├── client/                     # Frontend React SPA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── pages/              # Các trang chính (Login, ExamRoom, Result, Admin,...)
│   │   ├── components/         # Thành phần UI (Timer, Sidebar, QuestionCard,...)
│   │   ├── hooks/              # Logic frontend (useAuth, useExam, useTimer,...)
│   │   ├── services/           # Gọi API backend
│   │   ├── utils/              # Hàm tiện ích (validate, format thời gian)
│   │   ├── i18n/en.json        # File ngôn ngữ
│   │   ├── App.tsx             # Cấu hình Router chính
│   │   ├── index.tsx           # Điểm vào React
│   │   └── routes.tsx
│   ├── Tailwind.config.js      # Cấu hình Tailwind CSS
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── package.json
│   └── index.html
│
├── db/
│   ├── schema.sql              # Cấu trúc cơ sở dữ liệu (DDL)
│   ├── seed.sql                # Dữ liệu mẫu (môn học, lớp, user, câu hỏi)
│   └── README.md
│
├── docs/
│   ├── design/                 # Tài liệu ERD, Glossary, Logical Schema
│   ├── contracts/              # Chính sách grading, timing, randomization
│   ├── report.pdf              # Báo cáo cuối kỳ
│   └── rubric_matrix.md
│
├── tests/                      # Unit tests & load tests
│
├── docker-compose.yml           # Chạy toàn hệ thống bằng Docker
├── .env.example                 # Biến môi trường mẫu
├── .gitignore
└── LICENSE

```

---

## ⚙️ CÀI ĐẶT MÔI TRƯỜNG

### 1️⃣ Cài đặt phần mềm cần thiết

| Thành phần | Phiên bản tối thiểu |
|-------------|--------------------|
| .NET SDK    | ≥ 8.0 |
| Node.js + npm | ≥ 18 |
| SQL Server (Microsoft) | 2019 / 2022 |
| Git | Bất kỳ |

**Tải SQL Server Developer + SSMS (Microsoft SQL Server Management Studio):**
🔗 https://www.microsoft.com/en-us/sql-server/sql-server-downloads

---

## 🧩 KHỞI TẠO DATABASE (SQL SERVER)

### 🔹 Bước 1: Mở SSMS (SQL Server Management Studio)

Kết nối với SQL Server (ví dụ):
```

Server name: localhost
Authentication: SQL Server Authentication
Login: sa
Password: YourStrong@Passw0rd

````

### 🔹 Bước 2: Tạo database

Trong SSMS → New Query → chạy:

```sql
CREATE DATABASE OnlineExamDb;
GO
````

### 🔹 Bước 3: Chạy script khởi tạo

Chạy 2 file SQL trong thư mục `db/`:

```sql
-- Tạo bảng
:r .\db\schema.sql

-- Seed dữ liệu mẫu
:r .\db\seed.sql
```

Hoặc trong terminal (nếu có `sqlcmd`):

```bash
sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -d master -i db/schema.sql
sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -d OnlineExamDb -i db/seed.sql
```

---

## 🖥️ CHẠY DỰ ÁN TRÊN LOCAL

### 🧱 Backend (ASP.NET Core API)

#### 🔹 Cấu hình `.env` hoặc `appsettings.json`

Trong `api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=OnlineExamDb;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "Key": "ChuoiBiMatRatDai123456",
    "Issuer": "OnlineExam",
    "Audience": "OnlineExamUsers"
  },
  "AllowedHosts": "*"
}
```

#### 🔹 Cài đặt dependencies & chạy API

```bash
cd api
dotnet restore
dotnet build
dotnet run
```

API sẽ chạy tại:
🌐 `https://localhost:5001/swagger` (Swagger UI để test endpoints)

---

### 💻 Frontend (React + Vite)

#### 🔹 Cài dependencies

```bash
cd ../client
npm install
```

Cài thêm Tailwind (nếu chưa có):

```bash
npm install tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography
npx tailwindcss init -p
```

Thêm vào `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 🔹 Chạy frontend

```bash
npm run dev
```

Frontend sẽ chạy tại:
🌐 `http://localhost:3000`

> Lưu ý: đảm bảo backend API đang chạy ở `https://localhost:5001` để tránh lỗi CORS.

---

## 🔗 KẾT NỐI FRONTEND ↔ BACKEND

Trong file `client/src/services/useApi.ts` hoặc `.env` frontend, cấu hình endpoint:

```
VITE_API_BASE_URL=https://localhost:5001
```

Tất cả services (authService, examService, questionService, ...) sẽ tự động gọi API dựa trên biến này.

---

## 🧱 TỔNG QUAN LUỒNG CHẠY HỆ THỐNG

| Luồng                     | File chính liên quan                         | Mô tả                                        |
| ------------------------- | -------------------------------------------- | -------------------------------------------- |
| **Đăng nhập**             | LoginPage.tsx → useAuth.ts → authService.ts  | Gửi yêu cầu `/api/auth/login`, lưu token JWT |
| **Xem danh sách kỳ thi**  | ExamListPage.tsx → examService.ts            | Lấy danh sách kỳ thi được gán cho sinh viên  |
| **Vào phòng thi**         | ExamRoomPage.tsx → useExam.ts + Timer.tsx    | Nhận đề thi, random câu hỏi, chạy đồng hồ    |
| **Làm bài & lưu tự động** | useExam.ts → examService.saveAnswers()       | Lưu câu trả lời định kỳ (autosave)           |
| **Giám sát**              | monitoringService.ts → MonitoringHub.cs      | Giáo viên xem realtime progress qua SignalR  |
| **Nộp bài & chấm điểm**   | examService.submitExam() → GradingService.cs | Nộp bài, chấm điểm tự động                   |
| **Xem kết quả**           | ResultsPage.tsx → resultService.ts           | Hiển thị điểm và chi tiết bài làm            |

---

## 📘 NHIỆM VỤ TỪNG FILE CHÍNH

| Vị trí                               | Nhiệm vụ                                                  |
| ------------------------------------ | --------------------------------------------------------- |
| **api/Controllers/**                 | Xử lý các yêu cầu REST, gọi services                      |
| **api/Hubs/**                        | Truyền realtime dữ liệu giữa client và server qua SignalR |
| **api/Services/**                    | Xử lý logic nghiệp vụ chính (Auth, Exam, Grading, Audit)  |
| **api/Data/ApplicationDbContext.cs** | Giao tiếp EF Core với SQL Server                          |
| **api/Data/Configurations/**         | Cấu hình quan hệ và khóa ngoại giữa các bảng              |
| **api/Helpers/**                     | Mã hóa mật khẩu, random đề, chấm điểm từng phần           |
| **api/Middleware/**                  | Bắt lỗi toàn cục, ghi log audit mỗi request               |
| **client/src/pages/**                | Các trang giao diện chính                                 |
| **client/src/components/**           | Thành phần UI tái sử dụng                                 |
| **client/src/hooks/**                | Chứa logic React (authentication, countdown, exam flow)   |
| **client/src/services/**             | Các module gọi API backend                                |
| **client/src/utils/**                | Hàm định dạng và validate dữ liệu                         |
| **db/schema.sql**                    | Tạo cấu trúc bảng, khóa chính, khóa ngoại                 |
| **db/seed.sql**                      | Dữ liệu mẫu (user, class, subject, question)              |
| **docker-compose.yml**               | Chạy API + Client + SQL Server đồng thời qua Docker       |
| **.env.example**                     | Biến môi trường mẫu (điền thật vào .env)                  |

---

## 🧰 LỆNH TẮT HỮU ÍCH

| Mục đích                | Lệnh                             |
| ----------------------- | -------------------------------- |
| Cài đặt toàn bộ         | `dotnet restore && npm install`  |
| Chạy Backend            | `cd api && dotnet run`           |
| Chạy Frontend           | `cd client && npm run dev`       |
| Build Frontend          | `npm run build`                  |
| Chạy tất cả bằng Docker | `docker compose up`              |
| Kiểm tra Swagger        | `https://localhost:5001/swagger` |

---

## 🔒 LƯU Ý BẢO MẬT

* Không commit `.env`, `.pfx`, hoặc chuỗi JWT_SECRET vào repo.
* Mọi timestamp lưu theo **UTC**, frontend sẽ tự convert sang local.
* Mật khẩu được băm bằng **Argon2id hoặc Bcrypt**.
* Chỉ cho phép origin `https://localhost:3000` (frontend) trong CORS.

---

## 📜 GIẤY PHÉP

Dự án được phát hành theo giấy phép **MIT License**.
Bạn có thể sử dụng, sao chép, sửa đổi hoặc triển khai tự do — miễn giữ nguyên dòng bản quyền.

---

> 🧑‍💻 **Tác giả:** Phạm Ngọc Hưng – MSSV: 20235342
> 🏫 Trường Đại học Bách Khoa Hà Nội – Khoa CNTT
> 📅 Cập nhật: 26/10/2025

```

---

### ✅ Hướng dẫn tiếp theo
Bạn có thể:
- Copy nội dung trên → lưu thành `README.md` trong thư mục gốc dự án.
- Khi push lên GitHub, GitHub sẽ tự hiển thị đầy đủ Markdown.
- Nếu bạn muốn, mình có thể tạo thêm **file README_EN.md** bản tiếng Anh song song (chuẩn cho báo cáo song ngữ).

Bạn có muốn mình làm luôn bản `README_EN.md` không?
```
