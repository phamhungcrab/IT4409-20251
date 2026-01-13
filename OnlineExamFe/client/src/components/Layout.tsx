import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Sidebar, { SidebarLink } from './Sidebar';
import AnnouncementBanner from './AnnouncementBanner';
import NotificationBell from './NotificationBell';
import { useAnnouncements } from '../hooks/useAnnouncements';

const Layout: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { announcements, allAnnouncements, unreadCount, dismiss, markAsRead } = useAnnouncements(user);
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };
    const getLinks = (): SidebarLink[] => {
        const links: SidebarLink[] = [];
        if (!user) {
            links.push({
                path: '/login',
                label: t('nav.login'),
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                ),
            });
            return links;
        }

        if (user.role === 'Student') {
            links.push({path: '/', label: t('nav.home') || 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>)});
            links.push({path: '/student/classes', label: t('nav.classes') || 'Lớp học', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>)});
            links.push({path: '/student/subjects', label: t('nav.subjects') || 'Môn học', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>)});
            links.push({path: '/exams', label: t('nav.exams'), icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>)});
            links.push({path: '/results', label: t('nav.results'), icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>)});
        }
        if (user.role === 'Teacher') {
             links.push({path: '/', label: t('nav.dashboard'), icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>)});
             links.push({path: '/classes', label: t('nav.classes'), icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>)});
             links.push({path: '/exams', label: t('nav.exams'), icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>)});
        }
        return links;
    };

    return (
        <div className="min-h-screen flex text-slate-900 dark:text-slate-100 bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
            <Sidebar links={getLinks()} />
            <div className="flex-1 flex flex-col">
                <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/5 bg-slate-900/70">
                    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-200/70 sm:text-xs sm:tracking-[0.35em]">
                                Online Exam
                            </p>
                            <h1 className="text-xl font-semibold text-white sm:text-2xl">Control Center</h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
                                {['en', 'vi'].map((lng) => (
                                    <button
                                        key={lng}
                                        onClick={() => changeLanguage(lng)}
                                        className={`px-2.5 py-1 text-xs sm:text-sm rounded-full ${
                                            i18n.language === lng ? 'bg-white text-slate-900 shadow-sm' : 'text-sky-100'
                                        }`}
                                        aria-pressed={i18n.language === lng}
                                    >
                                        {lng.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={toggleTheme}
                                className="shrink-0 p-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm text-slate-500 dark:text-gray-300"
                                title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
                            >
                                {theme === 'dark' ? (
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                )}
                            </button>

                            {/* Notification Bell */}
                            {user && (
                                <NotificationBell
                                    announcements={allAnnouncements}
                                    unreadCount={unreadCount}
                                    onMarkAsRead={markAsRead}
                                />
                            )}

                             {user && (
                                <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 shadow-sm">
                                  <Link
                                    to="/profile"
                                    className="flex items-center gap-2 px-1 py-0.5 hover:bg-white/10 rounded-full transition-colors group"
                                    title={t('nav.profile') || 'Hồ sơ cá nhân'}
                                  >
                                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-sm font-semibold text-white group-hover:scale-105 transition-transform border border-white/10">
                                      {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                                    </div>
                                    <div className="min-w-0 text-left mr-2 hidden sm:block">
                                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role || 'User'}</p>
                                      <p className="max-w-[120px] truncate text-sm font-semibold text-white">
                                        {user.email}
                                      </p>
                                    </div>
                                  </Link>
                                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                                  <button
                                    onClick={logout}
                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors"
                                    aria-label={t('auth.logout')}
                                    title={t('auth.logout')}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                        </div>
                    </div>
                </header>

                <div className="lg:hidden px-4 pt-4 sm:px-6">
                    <nav className="flex flex-wrap gap-2 sm:gap-3">
                        {getLinks().map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="tag hover:border-white/40 hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    {user && announcements.length > 0 && (
                        <div className="mb-4 sm:mb-6">
                            <AnnouncementBanner announcements={announcements} onDismiss={dismiss} />
                        </div>
                    )}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
export default Layout;
