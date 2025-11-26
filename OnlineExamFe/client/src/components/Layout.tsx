/**
 * Layout component for the Online Examination System.
 *
 * This component renders a common page structure consisting of a header
 * with navigation links and a `<main>` section where nested routes are
 * rendered via `<Outlet>`.  Customize the navigation items to suit your
 * application's requirements, and consider extracting them into a separate
 * component once they become more complex (e.g. responsive menus).
 */

import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            <Link to="/">Online Examination System</Link>
          </h1>
          <nav className="space-x-4">
            {/* Navigation links.  Update or hide links based on auth state. */}
            <Link to="/exams" className="hover:underline">Exams</Link>
            <Link to="/results" className="hover:underline">Results</Link>
            <Link to="/admin" className="hover:underline">Admin</Link>
            <Link to="/login" className="hover:underline">Login</Link>
          </nav>
        </div>
      </header>
      {/* Main content area */}
      <main className="flex-grow container mx-auto p-4">
        {/* Outlet renders the matched child route component */}
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="bg-gray-200 text-center p-4 text-sm">
        © {new Date().getFullYear()} Online Examination System
      </footer>
    </div>
  );
};

export default Layout;