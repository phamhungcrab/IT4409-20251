/**
 * NotFoundPage component.
 *
 * Renders a friendly 404 page when a user navigates to a non-existent route.
 * Provides a message and a link back to the home page.  The `Layout`
 * component in routes.tsx will display this page for any unmatched path.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="glass-card px-8 py-10 space-y-4 max-w-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-200/80">Lost in space</p>
        <h1 className="text-5xl font-bold text-white">404</h1>
        <p className="text-lg text-slate-200">Oops! The page you are looking for doesn&apos;t exist.</p>
      </div>
      <Link
        to="/"
        className="btn btn-primary hover:-translate-y-0.5"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
