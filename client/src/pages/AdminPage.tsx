/**
 * AdminPage component.
 *
 * Serves as the landing page for administrative users.  It outlines the
 * management areas available in the system, such as user management,
 * question bank maintenance, exam scheduling, and monitoring.  The
 * individual management pages are not implemented here but would be
 * accessed via links or nested routes.  Only users with the ADMIN role
 * should see this page.  Enforce role-based access in your routing or
 * middleware as appropriate.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const AdminPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="text-gray-600">
        Welcome, administrator.  Use the links below to manage the system.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {/* User management tile */}
        <div className="p-4 border rounded-lg bg-white shadow space-y-2">
          <h2 className="text-lg font-medium">Users</h2>
          <p className="text-sm text-gray-500">
            Create, edit and delete users.  Assign roles and reset passwords.
          </p>
          <Link
            to="#"
            className="inline-block mt-2 px-3 py-1.5 text-sm text-blue-600 hover:underline"
          >
            Manage Users
          </Link>
        </div>
        {/* Question bank management tile */}
        <div className="p-4 border rounded-lg bg-white shadow space-y-2">
          <h2 className="text-lg font-medium">Questions</h2>
          <p className="text-sm text-gray-500">
            Maintain the question bank, including options and correct answers.
          </p>
          <Link
            to="#"
            className="inline-block mt-2 px-3 py-1.5 text-sm text-blue-600 hover:underline"
          >
            Manage Questions
          </Link>
        </div>
        {/* Exam management tile */}
        <div className="p-4 border rounded-lg bg-white shadow space-y-2">
          <h2 className="text-lg font-medium">Exams</h2>
          <p className="text-sm text-gray-500">
            Create and schedule exams, assign them to classes or individuals.
          </p>
          <Link
            to="#"
            className="inline-block mt-2 px-3 py-1.5 text-sm text-blue-600 hover:underline"
          >
            Manage Exams
          </Link>
        </div>
        {/* Monitoring & Reports tile */}
        <div className="p-4 border rounded-lg bg-white shadow space-y-2">
          <h2 className="text-lg font-medium">Monitoring & Reports</h2>
          <p className="text-sm text-gray-500">
            View live exam sessions and export results and analytics.
          </p>
          <Link
            to="#"
            className="inline-block mt-2 px-3 py-1.5 text-sm text-blue-600 hover:underline"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;