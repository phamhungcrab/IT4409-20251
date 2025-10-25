/**
 * Route configuration for the React application.
 *
 * The routes are defined as an array of `RouteObject` values compatible with
 * React Router v6.  Each route can specify a `path`, the element to render
 * when the path matches, and optional `children` for nested routes.  Lazy
 * loading is used to split code for each page, reducing the initial bundle
 * size.  Update the paths and page components as you add more screens.
 */

import React, { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy-loaded page components.  React.lazy allows components to be loaded
// asynchronously when they are first rendered.  The webpack/vite bundler
// creates separate chunks for each lazy import.
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ExamListPage = lazy(() => import('./pages/ExamListPage'));
const ExamRoomPage = lazy(() => import('./pages/ExamRoomPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * Define the application routes.  The top-level route uses the `Layout`
 * component, which renders a header/navigation and an outlet for nested
 * routes via `<Outlet />`.  Nested routes correspond to pages: home,
 * login, exam list, exam room (by ID), results, and admin.  A catch-all
 * route renders the NotFound page for any unknown path.
 */
export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'exams',
        element: <ExamListPage />,
      },
      {
        path: 'exam/:examId',
        element: <ExamRoomPage />,
      },
      {
        path: 'results',
        element: <ResultsPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export default appRoutes;