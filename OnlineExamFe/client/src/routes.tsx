/**
 * Cấu hình các route (đường dẫn) cho ứng dụng React.
 *
 * Ý tưởng:
 *  - Mỗi "màn hình" / "trang" (Home, Login, ExamList,...) tương ứng với một route.
 *  - Mỗi route có:
 *      + path : đường dẫn trên URL (vd: '/login', '/exams', '/exam/:examId',...).
 *      + element : component sẽ được render khi path khớp.
 *      + children : các route con (route lồng nhau), dùng với Layout + <Outlet />.
 *
 * React Router v6 cung cấp kiểu RouteObject để định nghĩa cấu hình routes dưới dạng mảng.
 * File này không trực tiếp render gì, mà chỉ export mảng appRoutes để chỗ khác (App.tsx)
 * dùng hook useRoutes(appRoutes) biến nó thành cây component thực sự.
 */

import React, { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import RoleGuard from './components/RoleGuard';

/**
 * Khai báo các trang (page) dạng lazy-loaded bằng React.lazy.
 *
 * React.lazy(() => import('./pages/HomePage')):
 *  - Chỉ load code của HomePage khi HomePage thực sự được render lần đầu.
 *  - Ưu điểm: giảm kích thước bundle ban đầu, app tải nhanh hơn.
 *  - Kết hợp với <Suspense> ở App.tsx để hiển thị màn hình "Loading..." trong lúc chờ tải.
 */
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ExamListPage = lazy(() => import('./pages/ExamListPage'));
const ExamRoomPage = lazy(() => import('./pages/ExamRoomPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * Mảng appRoutes định nghĩa toàn bộ route cho ứng dụng.
 *
 * Cấu trúc:
 *  - Route cấp cao nhất:
 *      path   : '/'
 *      element: <Layout />
 *      children: [...các route con...]
 *
 *  - Layout:
 *      + Thường chứa Header, Footer, Sidebar,...
 *      + Bên trong Layout sẽ có <Outlet /> nơi React Router render route con.
 *
 *  - Một số khái niệm:
 *      + index: true    -> route "mặc định" của parent (ở đây là trang Home, path '/').
 *      + path: 'login'  -> tương ứng với URL '/login'.
 *      + path: 'exam/:examId'
 *          - ':examId' là "route param", ví dụ '/exam/123' => examId = '123'.
 *      + path: '*'      -> route bắt mọi đường dẫn không khớp (404 Not Found).
 *
 *  - RoleGuard:
 *      + Là component custom, bọc quanh page để kiểm tra quyền (role) của người dùng.
 *      + Props allowedRoles = ['Student', 'Teacher', ...] cho biết những role nào được vào.
 *      + Nếu user không có role phù hợp, RoleGuard có thể redirect sang login hoặc show lỗi.
 */
export const appRoutes: RouteObject[] = [
  {
    // Route gốc, tương ứng với path '/'
    path: '/',
    // Layout là component khung (header, sidebar, main content wrapper,...)
    // Bên trong Layout sẽ có <Outlet /> để render các route con bên dưới.
    element: <Layout />,
    // children: các route con nằm dưới Layout
    children: [
      {
        // index: true nghĩa là route mặc định khi path = '/'
        // Tức là khi vào '/', nó sẽ render <HomePage />
        index: true,
        element: <HomePage />,
      },
      {
        // /login
        path: 'login',
        element: <LoginPage />,
      },
      {
        // /exams
        path: 'exams',
        // Bọc ExamListPage trong RoleGuard:
        //  - Chỉ các role 'Student', 'Teacher', 'Admin' mới truy cập được.
        element: (
          <RoleGuard allowedRoles={['Student', 'Teacher', 'Admin']}>
            <ExamListPage />
          </RoleGuard>
        ),
      },
      {
        // /exam/:examId
        // ':examId' là biến, ví dụ: /exam/10, /exam/abc123
        // Bên trong ExamRoomPage có thể dùng useParams() để lấy examId.
        path: 'exam/:examId',
        // Chỉ cho phép role 'Student' truy cập phòng thi.
        element: (
          <RoleGuard allowedRoles={['Student']}>
            <ExamRoomPage />
          </RoleGuard>
        ),
      },
      {
        // /results 
        path: 'results',
        // Trang xem kết quả, cho phép nhiều loại role (Student, Teacher, Admin)
        element: (
          <RoleGuard allowedRoles={['Student', 'Teacher', 'Admin']}>
            <ResultsPage />
          </RoleGuard>
        ),
      },
      {
        // /admin
        path: 'admin',
        // Chỉ Admin mới được vào trang quản trị.
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <AdminPage />
          </RoleGuard>
        ),
      },
      {
        // '*' là "catch-all route": khớp mọi path không khớp các route ở trên.
        // Dùng để hiển thị trang 404 Not Found.
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export default appRoutes;
