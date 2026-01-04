/**
 * File cấu hình Tailwind CSS cho dự án.
 *
 * Tailwind là một framework CSS dạng utility (các class nhỏ lẻ như: flex, p-4, text-center,...).
 * File này dùng để:
 *  - Chỉ cho Tailwind biết: cần quét (scan) những file nào để tìm class (mục `content`).
 *  - Mở rộng (extend) chủ đề giao diện: màu sắc, font, khoảng cách,... (mục `theme`).
 *  - Khai báo các plugin bổ sung (mục `plugins`), ví dụ plugin để style form, văn bản,...
 *
 * Khi build, Tailwind sẽ:
 *  - Đi qua tất cả file trong `content`,
 *  - Tìm các class như 'bg-primary', 'text-secondary-dark', 'font-sans',...
 *  - Tự động generate CSS tương ứng, giúp bundle CSS nhỏ gọn và chỉ chứa những class thực sự dùng.
 */

/** @type {import('tailwindcss').Config} */
// Dòng trên chỉ là để trình soạn thảo (VSCode) hiểu kiểu dữ liệu config, gợi ý code tốt hơn.
module.exports = {
  // `content` nói cho Tailwind biết: cần quét (scan) những file nào để tìm class Tailwind.
  darkMode: 'class', // Add class-based dark mode support
  content: [
    "./index.html",               // quét luôn file index.html ở gốc (client/index.html)
    "./src/**/*.{js,ts,jsx,tsx}", // quét toàn bộ file trong src/ có đuôi js, ts, jsx, tsx (code React)
  ],

  // `theme` là nơi định nghĩa/tùy chỉnh hệ thống thiết kế (design system): màu, font, spacing,...
  theme: {
    // `extend` nghĩa là: bổ sung thêm vào theme mặc định của Tailwind, không ghi đè hoàn toàn.
    extend: {
      colors: {
        /**
         * Định nghĩa bộ màu "primary" để dùng thống nhất trong toàn bộ ứng dụng.
         * Khi khai báo như này, ta sẽ có thể dùng class:
         *  - bg-primary        => background dùng màu primary.DEFAULT
         *  - bg-primary-light  => background dùng màu primary.light
         *  - bg-primary-dark   => background dùng màu primary.dark
         *
         * Lưu ý: mã màu là dạng HEX, ví dụ: '#fa6060ff'
         *  - 'light'  : màu nhạt hơn (ví dụ dùng cho hover, nền phụ)
         *  - 'DEFAULT': màu chính (dùng cho nút chính, màu thương hiệu)
         *  - 'dark'   : màu đậm hơn (dùng cho text, border, trạng thái active)
         */
        primary: {
          light: '#fa6060ff',
          DEFAULT: '#5af63bff',
          dark: '#cad71dff',
        },

        /**
         * Tương tự như primary nhưng cho bộ màu "secondary".
         * Có thể dùng cho các thành phần phụ, trạng thái phụ, hoặc nhấn khác màu.
         * Class dùng tương tự:
         *  - text-secondary
         *  - bg-secondary-light
         *  - border-secondary-dark
         */
        secondary: {
          light: '#fbbf24',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
      },

      fontFamily: {
        /**
         * Khai báo font chữ mặc định cho 'sans' (các class font-sans).
         *
         * Ý nghĩa:
         *  - 'Inter'          : cố gắng dùng font Inter (nếu đã được load qua CSS/Google Fonts).
         *  - 'ui-sans-serif'  : fallback dùng font sans-serif mặc định của hệ điều hành/UI.
         *  - 'system-ui'      : fallback khác dùng font hệ thống.
         *
         * Khi đó trong code, em chỉ cần dùng:
         *  - class="font-sans"
         * là text sẽ dùng chuỗi font này (Inter -> ui-sans-serif -> system-ui).
         */
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },

  // `plugins` là nơi khai báo các plugin mở rộng chức năng cho Tailwind.
  plugins: [
    // Plugin @tailwindcss/forms: giúp các thẻ form (input, select, textarea, checkbox,...) trông đều và đẹp hơn.
    require('@tailwindcss/forms'),

    // Plugin @tailwindcss/typography: cung cấp class `prose` để style văn bản dài (bài viết, nội quy, hướng dẫn,...).
    require('@tailwindcss/typography'),
  ],
};
