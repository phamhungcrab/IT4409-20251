# Cấu Trúc Dự Án OnlineExamFe

Chào mừng bạn đến với dự án! Tài liệu này mô tả cấu trúc thư mục và chức năng của các tệp tin trong phần Frontend (FE) của hệ thống thi trực tuyến. Dự án này được xây dựng bằng **React**, **TypeScript**, **Vite**, và **Tailwind CSS**.

## Tổng Quan Cấu Trúc

```
OnlineExamFe/
├── client/                     # Thư mục chính chứa source code FE
│   ├── public/                 # Tài nguyên tĩnh (images, icons, etc.)
│   ├── src/                    # Source code ứng dụng
│   │   ├── components/         # Các thành phần UI tái sử dụng
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── i18n/               # Cấu hình đa ngôn ngữ
│   │   ├── pages/              # Các trang chính (Views)
│   │   ├── services/           # Các hàm gọi API (Backend integration)
│   │   ├── utils/              # Các hàm tiện ích chung
│   │   ├── App.tsx             # Component gốc của ứng dụng
│   │   ├── index.css           # Global styles (bao gồm Tailwind directives)
│   │   ├── index.tsx           # Điểm khởi chạy ứng dụng (Mount React vào DOM)
│   │   └── routes.tsx          # Cấu hình định tuyến (Routing)
│   ├── index.html              # File HTML chính
│   ├── package.json            # Khai báo dependencies và scripts
│   ├── tailwind.config.js      # Cấu hình Tailwind CSS
│   ├── tsconfig.json           # Cấu hình TypeScript
│   └── vite.config.ts          # Cấu hình Build tool (Vite)
└── ...
```

## Chi Tiết Chức Năng

### 1. Cấu Hình & Gốc (Root)
- **`vite.config.ts`**: Cấu hình cho Vite (dev server, build settings, plugins).
- **`tailwind.config.js`**: Cấu hình giao diện, màu sắc, fonts cho Tailwind CSS.
- **`package.json`**: Quản lý các thư viện (dependencies) như React, Axios, i18next... và các lệnh chạy (`npm run dev`, `npm run build`).
- **`index.html`**: File HTML duy nhất được load, chứa thẻ `<div id="root">` nơi React app sẽ được render.

### 2. Source Code (`src/`)

#### a. `src/pages/` (Các màn hình chính)
Đây là các trang mà người dùng sẽ điều hướng tới:
- **`HomePage.tsx`**: Trang chủ, dashboard cho sinh viên/giáo viên.
- **`LoginPage.tsx`**: Trang đăng nhập.
- **`ExamListPage.tsx`**: Danh sách các kỳ thi đang có.
- **`ExamRoomPage.tsx`**: Giao diện làm bài thi (quan trọng nhất).
- **`ResultsPage.tsx`**: Trang xem kết quả thi.
- **`AdminPage.tsx`**: Trang quản trị (cho giáo viên/admin) để quản lý đề thi, câu hỏi.
- **`NotFoundPage.tsx`**: Trang lỗi 404.

#### b. `src/components/` (Thành phần UI)
Các block nhỏ được tái sử dụng trong các Pages:
- **`Layout.tsx`**: Khung sườn chung của web (Header, Footer, Main Content wrapper).
- **`Sidebar.tsx`**: Thanh điều hướng bên trái (nếu có).
- **`AnnouncementBanner.tsx`**: Banner thông báo (ví dụ: thông báo bảo trì, lịch thi).
- **`QuestionCard.tsx`**: Hiển thị một câu hỏi và các lựa chọn trả lời (dùng trong `ExamRoomPage`).
- **`OptionList.tsx`**: Danh sách các đáp án A, B, C, D.
- **`Timer.tsx`**: Đồng hồ đếm ngược thời gian làm bài.
- **`ResultTable.tsx`**: Bảng hiển thị điểm số/kết quả.
- **`RoleGuard.tsx`**: Component bảo vệ route, chỉ cho phép user có quyền (Admin/Student) truy cập.

#### c. `src/services/` (Giao tiếp Backend)
Nơi chứa các hàm gọi API (thường dùng Axios):
- **`authService.ts`**: Login, Register, Refresh Token.
- **`examService.ts`**: Lấy danh sách đề thi, chi tiết đề thi, nộp bài.
- **`questionService.ts`**: CRUD câu hỏi (cho Admin).
- **`resultService.ts`**: Lấy kết quả thi.
- **`monitoringService.ts`**: Có thể dùng để log hành vi hoặc giám sát thi.

#### d. `src/hooks/` (Logic tái sử dụng)
Chứa các Custom Hooks để tách biệt logic khỏi UI:
- Ví dụ: `useAnnouncements.ts` (lấy thông báo), `useAuth` (quản lý trạng thái đăng nhập), `useTimer`...

#### e. `src/i18n/` (Đa ngôn ngữ)
- Cấu hình `i18next` để hỗ trợ chuyển đổi ngôn ngữ (Tiếng Việt / Tiếng Anh).

#### f. Core Files
- **`App.tsx`**: Nơi thiết lập các Context Providers (Auth, Theme...) và Router.
- **`routes.tsx`**: Định nghĩa bản đồ URL -> Component (ví dụ: `/login` -> `LoginPage`).
- **`index.css`**: Nơi import Tailwind và viết các style tùy chỉnh global.

## Lời Khuyên Cho Người Mới (FE Lead)
1. **Bắt đầu từ `routes.tsx`**: Để hiểu luồng đi của ứng dụng.
2. **Xem `services/`**: Để biết FE đang giao tiếp với BE qua những API nào.
3. **Debug `ExamRoomPage.tsx`**: Đây là tính năng cốt lõi, hãy nắm vững cách state (câu trả lời của user) được lưu và gửi đi.
4. **Styling**: Dự án dùng Tailwind, hạn chế viết CSS thủ công trừ khi cần thiết.

Chúc bạn làm việc hiệu quả!
