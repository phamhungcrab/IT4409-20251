/**
 * authService module.
 *
 * Provides functions for interacting with the backend authentication
 * endpoints. Uses the centralized apiClient.
 */

import apiClient from '../utils/apiClient';

export enum UserRole {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Student = 'Student'
}

export interface LoginDto {
  email: string;
  password: string;
  ipAdress?: string;
  userAgent?: string;
  deviceId?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  mssv: string;
  role: UserRole;
  fullName: string;
  dateOfBirth: string; // ISO Date string
  ipAdress?: string;
  userAgent?: string;
  deviceId?: string;
}

export interface LogoutDto {
  userId: number;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SendOtpDto {
  email: string;
}

export interface CheckOtpDto {
  otp: string;
  email: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: async (data: LoginDto): Promise<TokenResponse> => {
    // Cast the result because our interceptor unwraps the response, but Axios types don't know that.
    return await apiClient.post<TokenResponse>('/api/AuthController/login', data) as unknown as Promise<TokenResponse>;
  },

  logout: async (data: LogoutDto): Promise<void> => {
    return await apiClient.post<void>('/api/AuthController/logout', data) as unknown as Promise<void>;
  },

  sendOtp: async (data: SendOtpDto): Promise<void> => {
    return await apiClient.post<void>('/api/AuthController/send-otp', data) as unknown as Promise<void>;
  },

  checkOtp: async (data: CheckOtpDto): Promise<void> => {
    return await apiClient.post<void>('/api/AuthController/check-otp', data) as unknown as Promise<void>;
  }
};