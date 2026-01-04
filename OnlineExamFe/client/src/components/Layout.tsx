import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Sidebar, { SidebarLink } from './Sidebar';
import AnnouncementBanner from './AnnouncementBanner';
import { useAnnouncements } from '../hooks/useAnnouncements';

const Layout: React.FC = () => {
  /**
   * useTranslation:
   *  - t(key): lấy chuỗi theo key đa ngôn ngữ (VD: t('nav.login'))
   *  - i18n: đối tượng điều khiển ngôn ngữ hiện tại (đổi ngôn ngữ, đọc language,...)
   */
  const { t, i18n } = useTranslation();

  /**
   * useAuth:
   *  - user: thông tin user hiện tại (email, role,...), null nếu chưa đăng nhập
   *  - logout: hàm đăng xuất (xóa token/user, gọi API logout nếu có)
   */
  const { user, logout } = useAuth();

  /**
   * useAnnouncements(user):
   *  - hook tự viết để lấy danh sách thông báo phù hợp với user hiện tại
   *  - ví dụ: học sinh thấy thông báo thi, giáo viên thấy thông báo lớp, admin thấy hệ thống,...
   *  - nếu user = null thì thường trả announcements rỗng hoặc thông báo chung (tùy cách viết hook)
   */
  const { announcements } = useAnnouncements(user);

  /**
   * Hàm đổi ngôn ngữ giao diện
   *  - lng: mã ngôn ngữ, ví dụ 'en' hoặc 'vi'
   */
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Theme logic
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

  /**
   * getLinks():
   *  - Tạo danh sách link hiển thị ở Sidebar (và nav mobile)
   *  - Link phụ thuộc vào trạng thái đăng nhập và role của user
   *
   * Luồng:
   *  - Nếu chưa login: chỉ hiện link Login
   *  - Nếu Student: hiện Exams + Results
   *  - Nếu Admin/Teacher: hiện Admin (dashboard quản trị/giáo viên)
   */
  const getLinks = (): SidebarLink[] => {
    const links: SidebarLink[] = [];

    // Not logged in -> only login link
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

    // Student links
    if (user.role === 'Student') {
      // Trang chủ (Dashboard)
      links.push({
        path: '/',
        label: t('nav.home') || 'Trang chủ',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      });
      // Lớp học
      links.push({
        path: '/student/classes',
        label: t('nav.classes') || 'Lớp học',
        icon: (
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
           </svg>
        ),
      });

      // Môn học
      links.push({
        path: '/student/subjects',
        label: t('nav.subjects') || 'Môn học',
        icon: (
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
           </svg>
        ),
      });

      // Danh sách bài thi
      links.push({
        path: '/exams',
        label: t('nav.exams'),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      });
      // Kết quả thi
      links.push({
        path: '/results',
        label: t('nav.results'),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      });
    }

    // Teacher dashboard
    if (user.role === 'Teacher') {
      links.push({
        path: '/',
        label: t('nav.dashboard'),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      });

      links.push({
        path: '/classes',
        label: t('nav.classes'),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
      });

      links.push({
        path: '/exams',
        label: t('nav.exams'),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      });
    }



    return links;
  };

  return (
    /**
     * Layout tổng:
     *  - Bên trái: Sidebar (menu)
     *  - Bên phải: khu nội dung chính gồm Header + Main
     */
    <div className="min-h-screen flex text-slate-900 dark:text-slate-100 bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
      {/* Sidebar: menu chính (thường hiện trên desktop) */}
      <Sidebar links={getLinks()} />

      {/* Khu nội dung bên phải */}
      <div className="flex-1 flex flex-col">
        {/* Header dính lên đầu trang (sticky) để khi scroll vẫn thấy */}
        <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/5 bg-slate-900/70">
          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            {/* Tiêu đề khu vực quản lý */}
            <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-sky-200/70 sm:text-xs sm:tracking-[0.35em]">
                  Online Exam
                </p>
                <h1 className="text-xl font-semibold text-white sm:text-2xl">Control Center</h1>
            </div>

            {/* Cụm bên phải: chọn ngôn ngữ + khu thông tin user + nút logout */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Bộ chọn ngôn ngữ: EN/VI */}
              <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
                {['en', 'vi'].map((lng) => (
                  <button
                    key={lng}
                    onClick={() => changeLanguage(lng)}
                    /**
                     * Nếu ngôn ngữ hiện tại = lng:
                     *  - button nổi bật (bg trắng, chữ đen)
                     * Nếu không:
                     *  - button bình thường
                     */
                    className={`px-2.5 py-1 text-xs sm:text-sm rounded-full ${
                      i18n.language === lng
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-sky-100'
                    }`}
                    // aria-pressed: hỗ trợ accessibility (thông báo nút đang được chọn hay không)
                    aria-pressed={i18n.language === lng}
                  >
                    {lng.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="shrink-0 p-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm text-slate-500 dark:text-gray-300"
                title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Nếu đã đăng nhập -> hiển thị thông tin user và nút logout */}
              {user && (
                <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 shadow-sm sm:gap-3 sm:px-3 sm:py-2">
                  {/* Avatar giả lập: lấy 2 ký tự đầu của email */}
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-sm font-semibold text-white">
                    {user.email.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Text hiển thị user đang login */}
                  <div className="min-w-0 text-left">
                    <p className="hidden text-xs text-slate-300 sm:block">{t('auth.loggedIn')}</p>
                    <p className="max-w-[160px] truncate text-sm font-semibold text-white sm:max-w-none">
                      {user.email}
                    </p>
                  </div>

                  {/* Nút logout: gọi hàm logout từ useAuth */}
                  <button
                    onClick={logout}
                    className="btn btn-ghost px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm hover:-translate-y-0.5"
                    aria-label={t('auth.logout')}
                  >
                    {t('auth.logout')}
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
          {/* Nếu đã login và có announcements -> hiển thị banner thông báo ở đầu trang */}
          {user && announcements.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <AnnouncementBanner announcements={announcements} />
            </div>
          )}

          {/* Outlet: chỗ React Router render trang con tương ứng với route hiện tại */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
