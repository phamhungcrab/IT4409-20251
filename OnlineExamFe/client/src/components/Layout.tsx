import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Sidebar, { SidebarLink } from './Sidebar';
import AnnouncementBanner from './AnnouncementBanner';
import { useAnnouncements } from '../hooks/useAnnouncements';

const Layout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { announcements } = useAnnouncements();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getLinks = (): SidebarLink[] => {
    const links: SidebarLink[] = [];
    if (!user) {
      links.push({ path: '/login', label: t('nav.login') });
      return links;
    }

    if (user.role === 'Student') {
      links.push({ path: '/exams', label: t('nav.exams') });
      links.push({ path: '/results', label: t('nav.results') });
    }

    if (user.role === 'Admin' || user.role === 'Teacher') {
      links.push({ path: '/admin', label: t('nav.admin') });
    }

    return links;
  };

  return (
    <div className="min-h-screen flex text-slate-100">
      <Sidebar links={getLinks()} />

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/5 bg-slate-900/70">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-200/70">Online Exam</p>
              <h1 className="text-2xl font-semibold text-white">Control Center</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
                {['en', 'vi'].map((lng) => (
                  <button
                    key={lng}
                    onClick={() => changeLanguage(lng)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      i18n.language === lng ? 'bg-white text-slate-900 shadow-sm' : 'text-sky-100'
                    }`}
                    aria-pressed={i18n.language === lng}
                  >
                    {lng.toUpperCase()}
                  </button>
                ))}
              </div>

              {user && (
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-sm">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-sm font-semibold text-white">
                    {user.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-300">{t('auth.loggedIn')}</p>
                    <p className="text-sm font-semibold text-white">{user.email}</p>
                  </div>
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
          {user && announcements.length > 0 && (
            <div className="mb-6">
              <AnnouncementBanner announcements={announcements} />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
