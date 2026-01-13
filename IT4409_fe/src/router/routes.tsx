import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Layout } from '../layouts/(admin)/Layout';
import LayoutUser from '../components/Layout';
import { ProtectedRoute } from './protectedRoute';
import RoleGuard from '../components/RoleGuard';

// Admin pages
const CMSExamBlueprint = lazy(() => import('../pages/(admin)/CMSExamBlueprint'));
const CMSHome = lazy(() => import('../pages/(admin)/CMSHome'));
const CMSLogin = lazy(() => import('../pages/(admin)/CMSLogin'));
const CMSSignup = lazy(() => import('../pages/(admin)/CMSSignup'));
const CMSClass = lazy(() => import('../pages/(admin)/CMSClass'));
const CMSClassDetail = lazy(() => import('../pages/(admin)/CMSClassDetail'));
const CMSExam = lazy(() => import('../pages/(admin)/CMSExam'));
const CMSQuestions = lazy(() => import('../pages/(admin)/CMSQuestion'));
const CMSResults = lazy(() => import('../pages/(admin)/CMSResult'));
const CMSAccounts = lazy(() => import('../pages/(admin)/CMSAccount'));
const CMSSubject = lazy(() => import('../pages/(admin)/CMSSubject'));
const CMSProfile = lazy(() => import('../pages/(admin)/CMSProfile'));

// User pages
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const ExamListPage = lazy(() => import('../pages/ExamListPage'));
const ExamRoomPage = lazy(() => import('../pages/ExamRoomPage'));
const ResultsPage = lazy(() => import('../pages/ResultsPage'));
const ResultDetailPage = lazy(() => import('../pages/ResultDetailPage'));
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const appRoutes: RouteObject[] = [
    // Public
    { path: '/user/login', element: <LoginPage /> },

    // User
    {
        path: '/user',
        element: <LayoutUser />,
        children: [
            { index: true, element: <HomePage /> },

            {
                path: 'exams',
                element: (
                    <RoleGuard allowedRoles={['Student', 'Teacher', 'Admin']}>
                        <ExamListPage />
                    </RoleGuard>
                ),
            },
            {
                path: 'exam/:examId',
                element: (
                    <RoleGuard allowedRoles={['Student']}>
                        <ExamRoomPage />
                    </RoleGuard>
                ),
            },
            {
                path: 'results',
                element: (
                    <RoleGuard allowedRoles={['Student', 'Teacher', 'Admin']}>
                        <ResultsPage />
                    </RoleGuard>
                ),
            },
            {
                path: 'results/:examId',
                element: (
                    <RoleGuard allowedRoles={['Student', 'Teacher', 'Admin']}>
                        <ResultDetailPage />
                    </RoleGuard>
                ),
            },
        ],
    },

    // Admin auth
    { path: '/login', element: <CMSLogin /> },
    // { path: '/admin/signup', element: <CMSSignup /> },

    // CMS
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            { path: '', element: <CMSAccounts /> },
            { path: 'blueprint', element: <CMSExamBlueprint /> },
            { path: 'class', element: <CMSClass /> },
            { path: 'class/:id', element: <CMSClassDetail /> },
            { path: 'exam', element: <CMSExam /> },
            { path: 'questions', element: <CMSQuestions /> },
            { path: 'results/:examId', element: <CMSResults /> },
            { path: 'subject', element: <CMSSubject /> },
            { path: 'profile', element: <CMSProfile /> }
        ],
    },

    // Error
    { path: '/403', element: <ForbiddenPage /> },
    { path: '*', element: <NotFoundPage /> },
];

export default appRoutes;
