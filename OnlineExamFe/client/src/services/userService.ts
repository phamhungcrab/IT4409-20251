import apiClient, { ResultApiModel } from '../utils/apiClient';
import { UserRole } from './authService';

export interface UserDto {
  id: number;
  mssv: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  role: UserRole;
}

export interface SearchUserPayload {
  fullName?: string;
  mssv?: string;
  email?: string;
  role?: UserRole;
  pageSize?: number;
  pageNumber?: number;
}

export interface SearchUserResult {
  totalItems: number;
  users: UserDto[];
}

// Admin-only; kept for backoffice flows
const getAll = async (): Promise<UserDto[]> => {
  const response = await apiClient.get<ResultApiModel<UserDto[]>>('/api/User/get-all');
  return response as unknown as UserDto[];
};

// Search endpoint works for all roles (SessionAuthorize default)
const searchForUser = async (payload: SearchUserPayload): Promise<SearchUserResult> => {
  const response = await apiClient.post<ResultApiModel<SearchUserResult>>('/api/User/search-for-user', payload);
  return response as unknown as SearchUserResult;
};

// Helper to fetch the first user that matches an email
const findByEmail = async (email: string): Promise<UserDto | null> => {
  const result = await searchForUser({ email, pageNumber: 1, pageSize: 1 });
  return result.users?.[0] ?? null;
};

export const userService = {
  getAll,
  searchForUser,
  findByEmail,
};
