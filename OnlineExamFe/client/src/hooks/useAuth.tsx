/**
 * useAuth hook and provider.
 *
 * This file defines an authentication context for the React app.
 * It uses authService for actual API calls.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, LoginDto, UserRole } from '../services/authService';

export interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user from local storage", e);
          localStorage.removeItem('user');
        }
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (data: LoginDto) => {
    try {
      const response = await authService.login(data);
      let sessionToken = '';

      if (typeof response === 'string') {
          sessionToken = response;
      } else if (response && typeof response === 'object' && 'accessToken' in response) {
          sessionToken = response.accessToken;
      }

      if (sessionToken) {
        setToken(sessionToken);
        localStorage.setItem('token', sessionToken);
        localStorage.removeItem('refreshToken'); // Cleanup old refresh tokens

        // Create a dummy user object since the session token is opaque
        // In a real app, we might fetch the user profile here
        const dummyUser: User = { id: 1, email: data.email, role: UserRole.Student };
        setUser(dummyUser);
        localStorage.setItem('user', JSON.stringify(dummyUser));
      }
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    if (user) {
        authService.logout({ userId: user.id }).catch(console.error);
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // Listen for global logout event from apiClient
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}