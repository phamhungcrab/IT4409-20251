import React from 'react';
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
    }

    // Admin dashboard
    if (user.role === 'Admin') {
      links.push({
        path: '/admin',
        label: t('nav.admin'),
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
    <div className="min-h-screen flex text-slate-100">
      {/* Sidebar: menu chính (thường hiện trên desktop) */}
      <Sidebar links={getLinks()} />

      {/* Khu nội dung bên phải */}
      <div className="flex-1 flex flex-col">
        {/* Header dính lên đầu trang (sticky) để khi scroll vẫn thấy */}
        <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/5 bg-slate-900/70">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Tiêu đề khu vực quản lý */}
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-200/70">
                Online Exam
              </p>
              <h1 className="text-2xl font-semibold text-white">Control Center</h1>
            </div>

            {/* Cụm bên phải: chọn ngôn ngữ + khu thông tin user + nút logout */}
            <div className="flex items-center gap-3">
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
                    className={`px-3 py-1 text-sm rounded-full ${
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

              {/* Nếu đã đăng nhập -> hiển thị thông tin user và nút logout */}
              {user && (
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-sm">
                  {/* Avatar giả lập: lấy 2 ký tự đầu của email */}
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-sm font-semibold text-white">
                    {user.email.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Text hiển thị user đang login */}
                  <div className="text-left">
                    <p className="text-xs text-slate-300">{t('auth.loggedIn')}</p>
                    <p className="text-sm font-semibold text-white">{user.email}</p>
                  </div>

                  {/* Nút logout: gọi hàm logout từ useAuth */}
                  <button
                    onClick={logout}
                    className="btn btn-ghost text-sm px-3 py-2 hover:-translate-y-0.5"
                    aria-label={t('auth.logout')}
                  >
                    {t('auth.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>


        <div className="lg:hidden px-6 pt-4">
          <nav className="flex gap-3 flex-wrap">
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

        <main className="flex-1 p-6 overflow-auto">
          {/* Nếu đã login và có announcements -> hiển thị banner thông báo ở đầu trang */}
          {user && announcements.length > 0 && (
            <div className="mb-6">
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
