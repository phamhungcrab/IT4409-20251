/**
 * LoginPage component.
 *
 * Provides a simple login form for the user to authenticate.  Users
 * supply an email (or username) and password.  In a real application
 * this form would call the backend via an auth service to obtain a
 * JWT and update application state.  Here, we demonstrate basic form
 * handling, validation and redirection on success.  You can replace
 * the stubbed login logic with your own implementation once the
 * appropriate hooks or services are available.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission.  Validates input fields and performs a
   * pseudo-login.  On success, navigates to the exam list page.  Replace
   * the stubbed logic with a real API call (e.g. authService.login)
   * when integrating with the backend.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Basic validation: both fields must be non-empty
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate an async login operation.  Replace with real API call.
      await new Promise((resolve) => setTimeout(resolve, 500));
      // On success, redirect the user to the exam list.  You could also
      // update a global auth context here.
      navigate('/exams');
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;