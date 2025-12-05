import apiClient, { ResultApiModel } from '../utils/apiClient';
import { UserRole } from './authService';

export interface UserDto {
  id: number;
  mssv: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  role: UserRole; // Assuming backend returns role as string or int matching enum
}

export const userService = {
  getAll: async (): Promise<UserDto[]> => {
    // The backend returns ResultApiModel with Data as the array
    const response = await apiClient.get<ResultApiModel<UserDto[]>>('/api/User/get-all');

    // apiClient interceptor unwraps ResultApiModel.data if isStatus=true.
    // However, we need to be careful if it returns the array directly or the ResultApiModel.
    // Looking at apiClient.ts (Step 320):
    // "if (result.isStatus) return result.data;"
    // So here we receive UserDto[].

    return response as unknown as UserDto[];
  },
};
