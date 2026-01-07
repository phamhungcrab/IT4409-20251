# React + Vite

Hệ thống thi trực tuyến cho học sinh và giáo viên

1. Hướng dẫn chạy code
npm install
npm run dev

Yêu cầu môi trường: NodeJS

2. Cấu trúc thư mục

a) Code chính: folder ./src
- assets: Tài nguyên tĩnh
- pages: Các trang chức năng chính của nền tảng
+ ./(admin): Các trang quản trị CMS của admin
+ ./(teacher): Các trang quản trị của teacher
+ Các trang còn lại là các trang chức năng chính của nền tảng, cho user
- components: UI tái sử dụng
- router: Định tuyến các trang, logic định tuyến
- lib: Các hàm tiện ích, hỗ trợ (axiosClient, react-query, middlewares...)
- services
- layouts: Các layout chung (header, footer, navbar)
- services: Danh sách hàm call API (tổ chức theo db)

b) Công nghệ
- ReactJS, Vite
- Tailwindcss

c) Môi trường 
NODE_ENV=
BASE_API_URL=
