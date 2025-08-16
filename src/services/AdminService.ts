import type { ApiResult, ServiceResult } from '@/types/api.types';
import type { User } from '@/types/user.types';
import { AuthService } from './AuthService';
import type { Skill, CreateSkillDto, UpdateSkillDto } from '../types/skill.types';

export interface DashboardStatistics {
  totalUsers: number;
  pendingVerifications: number;
  totalSkills: number;
  activeAdmins: number;
}

const API_URL = import.meta.env.VITE_API_BASE_URL;
const SKILLS_ENDPOINT = `${API_URL}/Skills`;

export const AdminService = {
  getDashboardStatistics: async (): Promise<ServiceResult<DashboardStatistics>> => {
    try {
      const fullUrl = `${API_URL}/Users/admin-dashboard-statistics`;
      const response = await AuthService.fetchWithAuth(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiResult<DashboardStatistics> = await response.json();
        return { success: false, error: errorData.error || `HTTP error! status: ${response.status}` };
      }

      const statistics: DashboardStatistics = await response.json();
      return { success: true, data: statistics };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      if (error instanceof Response && !error.ok) {
        try {
          const errorData: ApiResult<unknown> = await error.json();
          return { success: false, error: errorData.error || 'An unexpected error occurred while parsing the error response.' };
        } catch {
          return { success: false, error: 'An unexpected error occurred and the error response could not be parsed.' };
        }
      }
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  // User-related services
  getAllUsers: async (): Promise<ServiceResult<User[]>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_URL}/Users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiResult<User[]> = await response.json();
        return { success: false, error: errorData.error || `HTTP error! status: ${response.status}` };
      }

      const users: User[] = await response.json();
      return { success: true, data: users };
    } catch (error) {
      console.error('Error fetching all users:', error);
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

  banUser: async (userId: string): Promise<ServiceResult<null>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_URL}/Users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
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

  unbanUser: async (userId: string): Promise<ServiceResult<null>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_URL}/Users/${userId}/unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  // Skill-related services
  getAllSkills: async (): Promise<ServiceResult<Skill[]>> => {
    try {
      const response = await AuthService.fetchWithAuth(SKILLS_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData: ApiResult<Skill[]> = await response.json();
        let message = `HTTP error! status: ${response.status}`;
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            message = errorData.error;
          } else if (errorData.error && typeof errorData.error === 'object' && 'message' in errorData.error) {
            message = errorData.error.message;
          }
        }
        return { success: false, error: message };
      }
      const skills: Skill[] = await response.json();
      return { success: true, data: skills };
    } catch (error) {
      console.error('Error fetching all skills:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  addSkill: async (skillData: CreateSkillDto): Promise<ServiceResult<{ skillID: string }>> => {
    try {
      const response = await AuthService.fetchWithAuth(SKILLS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillData),
      });
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData: { message?: string; error?: string | { message?: string } } = await response.json();
          if (errorData.error) {
            if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (typeof errorData.error === 'object' && errorData.error.message) {
              errorMessage = errorData.error.message;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If parsing fails, use the generic HTTP error
        }
        return { success: false, error: errorMessage };
      }
      const responseData: { skillID: string } = await response.json();
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error adding skill:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  updateSkill: async (skillId: string, skillData: UpdateSkillDto): Promise<ServiceResult<Skill>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${SKILLS_ENDPOINT}/${skillId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillData),
      });
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData: ApiResult<Skill> = await response.json();
          if (errorData.error) {
            if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (errorData.error && typeof errorData.error === 'object' && 'message' in errorData.error) {
              errorMessage = errorData.error.message;
            }
          }
        } catch (e) {
          // If parsing fails, use the generic HTTP error
        }
        return { success: false, error: errorMessage };
      }
      const updatedSkill: Skill = await response.json();
      return { success: true, data: updatedSkill };
    } catch (error) {
      console.error(`Error updating skill ${skillId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  deleteSkill: async (skillId: string): Promise<ServiceResult<null>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${SKILLS_ENDPOINT}/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData: ApiResult<null> = await response.json();
          if (errorData.error) {
            if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (errorData.error && typeof errorData.error === 'object' && 'message' in errorData.error) {
              errorMessage = errorData.error.message;
            }
          }
        } catch (e) {
          // If parsing fails, use the generic HTTP error
        }
        return { success: false, error: errorMessage };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error(`Error deleting skill ${skillId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },
};