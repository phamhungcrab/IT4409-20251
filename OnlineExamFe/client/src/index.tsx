/**
 * Điểm khởi động (entry point) của ứng dụng React.
 *
 * File này có nhiệm vụ:
 *  - Tìm phần tử HTML có id="root" trong index.html.
 *  - Tạo "gốc" (root) React gắn vào phần tử đó.
 *  - Render component gốc <App /> bên trong các "wrapper" như:
 *      + <React.StrictMode> : bật thêm cảnh báo/hỗ trợ debug khi dev.
 *      + <BrowserRouter>    : cung cấp cơ chế routing (chuyển trang) cho toàn app.
 *      + <AuthProvider>     : cung cấp context đăng nhập/đăng xuất cho toàn app.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import './i18n/i18n';   // Khởi tạo hệ thống đa ngôn ngữ i18next cho toàn bộ ứng dụng

// Import CSS toàn cục, trong đó có các chỉ thị Tailwind.
// File index.css sẽ chứa:
//  - @tailwind base;
//  - @tailwind components;
//  - @tailwind utilities;
// Nhờ vậy các class Tailwind (bg-..., text-..., flex, mt-4,...) dùng được trong toàn app.
import './index.css';

// Tìm phần tử HTML có id="root" trong index.html
// Đây là "chỗ" mà React sẽ vẽ (render) toàn bộ giao diện vào.
const container = document.getElementById('root');
if (!container) {
  // Nếu không tìm thấy <div id="root"> thì ném lỗi rõ ràng để dev biết cấu hình HTML đang sai.
  throw new Error('Không tìm thấy phần tử root. Hãy chắc chắn index.html có div với id="root".');
}

// Tạo một React root gắn với phần tử container vừa tìm được
const root = ReactDOM.createRoot(container);

// Render ứng dụng React vào root
root.render(
  // React.StrictMode chỉ chạy ở chế độ development.
  // Nó giúp phát hiện một số lỗi tiềm ẩn, cảnh báo cách dùng API không chuẩn, v.v.
  <React.StrictMode>
    {/* BrowserRouter cung cấp ngữ cảnh routing (đường dẫn / URL) cho toàn bộ ứng dụng.
        Nhờ nó, ta có thể dùng <Routes>, <Route>, useNavigate, Link,... để chuyển trang
        mà không cần reload lại trình duyệt. */}
    <BrowserRouter>
      {/* AuthProvider là một Context Provider tự viết để quản lý trạng thái đăng nhập.
          Ví dụ: lưu thông tin user, token, hàm login(), logout().
          Bao bọc <App /> bên trong để mọi component con có thể dùng useAuth() lấy thông tin user. */}
      <AuthProvider> 
        {/* App là component gốc của ứng dụng, chứa layout chính, router, các page,... */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
