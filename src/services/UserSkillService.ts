import type { ApiResult, ServiceResult } from './api.types';
import type { UserSkill, UserSkillDto } from './skill.types';
import { AuthService } from './AuthService';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const USER_SKILLS_ENDPOINT = `${API_URL}/Skills/user-skills`;

export const UserSkillService = {
  addUserSkill: async (userSkillData: UserSkillDto): Promise<ServiceResult<UserSkill>> => {
    // Ensure the user is a tutor when adding a skill
    if (!userSkillData.isTutor) {
      return { success: false, error: 'Only tutors can add skills to their profile.' };
    }
    try {
      const response = await AuthService.fetchWithAuth(USER_SKILLS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSkillData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData: ApiResult<UserSkill> = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If parsing fails, use the generic HTTP error
        }
        return { success: false, error: errorMessage };
      }
      const addedUserSkill: UserSkill = await response.json();
      return { success: true, data: addedUserSkill };
    } catch (error) {
      console.error('Error adding user skill:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  getUserSkills: async (userId: string): Promise<ServiceResult<UserSkill[]>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${USER_SKILLS_ENDPOINT}/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: ApiResult<UserSkill[]> = await response.json();
        return { success: false, error: errorData.error || `HTTP error! status: ${response.status}` };
      }
      const userSkills: UserSkill[] = await response.json();
      return { success: true, data: userSkills };
    } catch (error) {
      console.error(`Error fetching skills for user ${userId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  deleteUserSkill: async (userSkillId: string): Promise<ServiceResult<null>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${USER_SKILLS_ENDPOINT}/${userSkillId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData: ApiResult<null> = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If parsing fails, use the generic HTTP error
        }
        return { success: false, error: errorMessage };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error(`Error deleting user skill ${userSkillId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },
};
