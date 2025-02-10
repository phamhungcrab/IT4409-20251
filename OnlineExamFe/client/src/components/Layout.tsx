import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Sidebar, { SidebarLink } from './Sidebar';

const Layout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

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
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar links={getLinks()} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Online Examination System
          </h1>
          <div className="flex items-center space-x-4">
            <div className="space-x-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('vi')}
                className={`px-2 py-1 rounded ${i18n.language === 'vi' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                VI
              </button>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Hello, {user.email}</span>
                <button onClick={logout} className="text-red-600 hover:text-red-800">
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;