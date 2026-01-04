/**
 * File routes.tsx: Cấu hình tuyến đường (route) cho ứng dụng React dùng React Router v6.
 *
 * Mục tiêu:
 *  - Mỗi "trang" (page) tương ứng với một đường dẫn URL.
 *  - Khi URL khớp với route nào thì React sẽ render component (element) của route đó.
 *
 * Khái niệm bạn cần biết:
 * 1) RouteObject (React Router v6):
 *    - Là kiểu dữ liệu mô tả cấu hình một route: gồm path, element, children,...
 *    - Ta khai báo routes bằng một mảng RouteObject[].
 *
 * 2) Layout + Outlet:
 *    - Layout là "khung" chung của web (sidebar, header, footer,...).
 *    - Trong Layout sẽ có <Outlet />: vị trí để React Router "nhét" trang con vào.
 *    - Nhờ vậy, mọi trang con đều dùng chung layout.
 *
 * 3) index route:
 *    - index: true nghĩa là trang mặc định của route cha.
 *    - Ví dụ route cha path '/', con index:true => khi vào '/' sẽ render trang con đó.
 *
 * 4) Route param (tham số trên URL):
 *    - Ví dụ 'exam/:examId' => khi vào '/exam/10' thì examId = '10'
 *    - Lấy examId trong page bằng useParams().
 *
 * 5) Lazy loading (React.lazy):
 *    - Dùng để tải code trang theo nhu cầu (khi cần mới tải).
 *    - Ưu điểm: giảm dung lượng tải ban đầu, trang load nhanh hơn.
 *    - Muốn dùng lazy thì phải bọc ở App.tsx bằng <Suspense fallback=...>.
 */

import React, { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import RoleGuard from './components/RoleGuard';

/**
 * Khai báo các trang (pages) theo kiểu lazy-load.
 *
 * Cách hoạt động:
 *  - React.lazy(() => import('./pages/HomePage')) nghĩa là:
 *    + Chưa tải file HomePage ngay lúc start app
 *    + Chỉ tải khi route cần render HomePage lần đầu
 *
 * Lưu ý:
 *  - Nếu không có <Suspense> ở App.tsx thì lazy sẽ lỗi.
 */
const HomePage = lazy(() => import('./pages/HomePage'));
const TeacherClassDetailPage = lazy(() => import('./pages/home/TeacherClassDetail'));
const TeacherClassListPage = lazy(() => import('./pages/home/TeacherClassList'));
const StudentClassListPage = lazy(() => import('./pages/StudentClassList'));
const StudentSubjectList = lazy(() => import('./pages/StudentSubjectList'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ExamListPage = lazy(() => import('./pages/ExamListPage'));
const ExamRoomPage = lazy(() => import('./pages/ExamRoomPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const ResultDetailPage = lazy(() => import('./pages/ResultDetailPage'));

const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * appRoutes: toàn bộ cấu hình route của ứng dụng.
 *
 * Cấu trúc tổng quát:
 *  - Route gốc: path '/'
 *  - element: <Layout /> (khung chung)
 *  - children: danh sách route con nằm trong Layout
 *
 * Tại sao dùng children:
 *  - Để mọi trang con dùng chung Layout (sidebar/header/...)
 *  - Layout sẽ render trang con tại <Outlet />
 */
export const appRoutes: RouteObject[] = [
  {
    /**
     * Route gốc (root route):
     * - path: '/'
     * - element: Layout => luôn hiện khung chung của website
     */
    path: '/',
    element: <Layout />,

    /**
     * children: các route con sẽ hiển thị bên trong Layout.
     * Khi URL khớp route con, Layout vẫn render, còn nội dung trang con
     * sẽ xuất hiện tại vị trí <Outlet /> trong Layout.
     */
    children: [
      {
        /**
         * Trang mặc định của '/'.
         * - index: true => khi vào đúng '/', route này được chọn.
         * - element: <HomePage /> => render trang Home.
         */
        index: true,
        element: <HomePage />,
      },
      {
        path: 'teacher/classes/:classId',
        element: (
          <RoleGuard allowedRoles={['Teacher']}>
            <TeacherClassDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'classes',
        element: (
          <RoleGuard allowedRoles={['Teacher']}>
            <TeacherClassListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'student/classes',
        element: (
          <RoleGuard allowedRoles={['Student']}>
             <StudentClassListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'student/subjects',
        element: (
          <RoleGuard allowedRoles={['Student']}>
            <StudentSubjectList />
          </RoleGuard>
        ),
      },
      {
        /**
         * Trang đăng nhập:
         * - path: 'login' => URL đầy đủ là '/login'
         */
        path: 'login',
        element: <LoginPage />,
      },
      {
        /**
         * Danh sách kỳ thi:
         * - URL: '/exams'
         * - Bọc RoleGuard để kiểm soát quyền truy cập
         *
         * RoleGuard làm gì:
         * - Nếu chưa đăng nhập (không có token) => redirect sang /login
         * - Nếu đăng nhập nhưng role không nằm trong allowedRoles => redirect hoặc chặn
        _toggle?: never,
         */
        path: 'exams',
        element: (
          <RoleGuard allowedRoles={['Student', 'Teacher']}>
            <ExamListPage />
          </RoleGuard>
        ),
      },
      {
        /**
         * Phòng thi:
         * - URL: '/exam/:examId'
         * - ':examId' là tham số động trên URL
         *   Ví dụ: /exam/10 => examId = '10'
         *
         * Chỉ Student mới được vào phòng thi => bọc RoleGuard.
         */
        path: 'exam/:examId',
        element: (
          <RoleGuard allowedRoles={['Student']}>
            <ExamRoomPage />
          </RoleGuard>
        ),
      },
      {
        /**
         * Trang danh sách kết quả:
         * - URL: '/results'
         * - Cho phép nhiều role xem (Student/Teacher/Admin) tùy nghiệp vụ
         */
        path: 'results',
        element: (
          <RoleGuard allowedRoles={['Student', 'Teacher']}>
            <ResultsPage />
          </RoleGuard>
        ),
      },
      {
        /**
         * Trang chi tiết kết quả (để tránh 404 khi click vào 1 kết quả):
         * - URL: '/results/:examId'
         * - ':examId' là tham số route, lấy bằng useParams()
         *
         * Lưu ý quan trọng:
         * - Bạn đang dùng ':examId'. Nhưng thực tế DB có thể dùng examStudentId hoặc resultId.
         * - FE và BE phải thống nhất: click vào dòng nào thì param là cái ID nào.
         * - Nếu BE trả về kết quả theo examStudentId thì nên đổi route thành:
         *   'results/:examStudentId' để khỏi nhầm.
         */
        path: 'results/:examId',
        element: (
          <RoleGuard allowedRoles={['Student', 'Teacher']}>
            <ResultDetailPage />
          </RoleGuard>
        ),
      },

      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        /**
         * Catch-all route:
         * - path: '*'
         * - Bắt mọi URL không khớp route nào ở trên => hiển thị trang 404
         *
         * Ví dụ:
         * - /abcxyz => không có route => rơi vào đây
         */
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export default appRoutes;
