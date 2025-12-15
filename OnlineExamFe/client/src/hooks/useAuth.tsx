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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
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

        try {
          const currentUser = await userService.findByEmail(data.email);

          if (currentUser) {
            let roleStr = String(currentUser.role);
            const roleLower = roleStr.toLowerCase();

            if (roleStr === '1' || roleLower === 'teacher') roleStr = UserRole.Teacher;
            else if (roleStr === '0' || roleLower === 'admin') roleStr = UserRole.Admin;
            else if (roleStr === '2' || roleLower === 'student') roleStr = UserRole.Student;

            const userObj: User = {
              id: currentUser.id,
              email: currentUser.email,
              role: roleStr,
            };

            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
          } else {
            console.warn('User not found via search-for-user, defaulting to Student role');
            const dummyUser: User = {
              id: 0,
              email: data.email,
              role: UserRole.Student,
            };
            setUser(dummyUser);
            localStorage.setItem('user', JSON.stringify(dummyUser));
          }
        } catch (e) {
          console.error('Failed to fetch user info after login', e);
          const fallbackUser: User = {
            id: 0,
            email: data.email,
            role: UserRole.Student,
          };
          setUser(fallbackUser);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
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
