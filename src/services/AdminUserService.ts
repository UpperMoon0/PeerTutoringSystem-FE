import type { User } from '@/types/user.types';
import type { ApiResult, ServiceResult } from '@/types/api.types';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const AdminUserService = {
  getAllUsers: async (token: string): Promise<ServiceResult<User[]>> => {
    try {
      const response = await fetch(`${API_URL}/Users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiResult<User[]> = await response.json();
        return { success: false, error: errorData.error || `HTTP error! status: ${response.status}` };
      }

      // If response is OK, the body is the array of users directly
      const users: User[] = await response.json();
      return { success: true, data: users }; 
    } catch (error) {
      console.error('Error fetching all users:', error);
      // Attempt to parse error response if it's a fetch error that might contain JSON
      if (error instanceof Response && !error.ok) {
        try {
          const errorData: ApiResult<any> = await error.json();
          return { success: false, error: errorData.error || 'An unexpected error occurred while parsing the error response.' };
        } catch (parseError) {
          return { success: false, error: 'An unexpected error occurred and the error response could not be parsed.' };
        }
      }
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  banUser: async (userId: string, token: string): Promise<ServiceResult<null>> => {
    try {
      const response = await fetch(`${API_URL}/Users/${userId}`, {
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

  unbanUser: async (userId: string, token: string): Promise<ServiceResult<null>> => {
    try {
      const response = await fetch(`${API_URL}/Users/${userId}/unban`, {
        method: 'POST',
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
      console.error(`Error unbanning user ${userId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },
};
