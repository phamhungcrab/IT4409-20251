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
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-3">404</h1>
      <p className="text-lg mb-5">Oops! The page you are looking for doesn&apos;t exist.</p>
      <Link
        to="/"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;