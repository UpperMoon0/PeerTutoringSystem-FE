import type { ApiResult } from '@/types/ApiResult';
import type { User } from '@/types/User';
import type { ServiceResult } from '@/types/ServiceResult';

const API_URL = import.meta.env.VITE_API_URL;

export const AdminUserService = {
  getAllUsers: async (token: string): Promise<ServiceResult<User[]>> => {
    try {
      const response = await fetch(`${API_URL}/api/Users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ApiResult<User[]> = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || `HTTP error! status: ${response.status}` };
      }

      return { success: true, data: data.data }; 
    } catch (error) {
      console.error('Error fetching all users:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  banUser: async (userId: string, token: string): Promise<ServiceResult<null>> => {
    try {
      const response = await fetch(`${API_URL}/api/Users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data: ApiResult<null> = await response.json();
        return { success: false, error: data.error || `HTTP error! status: ${response.status}` };
      }

      return { success: true, data: null };
    } catch (error) {
      console.error(`Error banning user ${userId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },
};
