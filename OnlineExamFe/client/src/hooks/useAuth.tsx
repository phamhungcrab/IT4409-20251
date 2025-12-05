/**
 * useAuth hook and provider.
 *
 * This file defines an authentication context for the React app.
 * It uses authService for actual API calls.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, LoginDto, UserRole } from '../services/authService';
import { userService } from '../services/userService';

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
        localStorage.removeItem('refreshToken');

        // Backend returns an opaque session string (not JWT).
        // We must fetch the user list to identify the current user's role and ID.
        try {
            const allUsers = await userService.getAll();
            // Match lowercase email just to be safe
            const currentUser = allUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());

            if (currentUser) {
                console.log('User found via lookup:', currentUser);

                // Map API role enum/string to proper Role string
                // Backend UserRole enum values might be integers or strings.
                // We'll convert to string to match UserRole enum usage in frontend.
                let roleStr = String(currentUser.role);

                // If it's number 0, 1, 2... map it manually if we knew the mapping.
                // Assuming backend returns string "Teacher", "Student", etc. as currently observed in DTOs.
                // If it returns int, we might need adjustments. For now, trusting DTOs.

                if (roleStr === '1' || roleStr === 'Teacher') roleStr = UserRole.Teacher;
                else if (roleStr === '0' || roleStr === 'Admin') roleStr = UserRole.Admin;
                else if (roleStr === '2' || roleStr === 'Student') roleStr = UserRole.Student;

                const userObj: User = {
                    id: currentUser.id,
                    email: currentUser.email,
                    role: roleStr
                };
                setUser(userObj);
                localStorage.setItem('user', JSON.stringify(userObj));
            } else {
                 console.warn('User not found in user list, defaulting to Student');
                 const dummyUser: User = { id: 0, email: data.email, role: UserRole.Student };
                 setUser(dummyUser);
                 localStorage.setItem('user', JSON.stringify(dummyUser));
            }

        } catch (e) {
            console.error('Failed to fetch user details to determine role', e);
            // Fallback to student so at least they can log in
            const dummyUser: User = { id: 0, email: data.email, role: UserRole.Student };
            setUser(dummyUser);
            localStorage.setItem('user', JSON.stringify(dummyUser));
        }
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