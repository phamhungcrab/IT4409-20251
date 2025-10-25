/**
 * useAuth hook and provider.
 *
 * This file defines an authentication context for the React app.  It
 * exposes the current user and JWT token along with login and logout
 * functions.  Tokens are persisted in `localStorage` to survive page
 * reloads.  The `login` function should call your backend auth endpoint
 * and store the returned token and user info.  In this stubbed version
 * we simulate authentication by accepting any credentials and assigning
 * a dummy user.  Replace the stubbed implementation with a real API
 * call once your backend is available.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// Represent a user of the system.  Expand this as needed (e.g. name,
// roles, permissions) based on your backend.
export interface User {
  id: number;
  email: string;
  role: string;
}

// Define the shape of the authentication context.  It includes the
// currently logged-in user (null if anonymous), the JWT token, and
// functions to log in and log out.  Additional functions (e.g. refresh
// tokens, register) can be added as needed.
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component that wraps the application and supplies auth state
 * and functions via context.  It reads the token from localStorage on
 * initial load and sets up a dummy user for demonstration purposes.  In
 * a real application you would decode the JWT or fetch the user profile
 * from the server using the token.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      // TODO: decode token or fetch current user from the API.  We
      // simulate a user object here.  Adjust as needed when your
      // authentication service is implemented.
      setUser({ id: 1, email: 'user@example.com', role: 'STUDENT' });
    } else {
      setUser(null);
    }
  }, [token]);

  /**
   * Perform a login.  In this stubbed version any non-empty credentials
   * are accepted and a dummy token is stored.  Replace this logic with
   * a POST to your `/auth/login` endpoint.  On success, store the
   * returned token in localStorage and set the user state accordingly.
   */
  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Normally you would call: const res = await fetch('/api/auth/login', ...)
    // and parse the returned token and user.  Here we assign dummy data.
    const dummyToken = 'dummy.jwt.token';
    const dummyUser: User = { id: 1, email, role: 'STUDENT' };
    setToken(dummyToken);
    setUser(dummyUser);
    localStorage.setItem('token', dummyToken);
  };

  /**
   * Log the user out by clearing the token and user state and removing
   * persisted data.  You may also wish to notify the backend to
   * invalidate refresh tokens.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook.  Provides convenient access to the authentication
 * context.  Must be used within an `AuthProvider`.  Throws an error
 * otherwise so you can catch misconfiguration early.
 */
export default function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}