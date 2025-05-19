import type { ApiResult, ServiceResult } from '../types/api.types';
import type { Skill, CreateSkillDto, UpdateSkillDto } from '../types/skill.types';
import { AuthService } from './AuthService';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const SKILLS_ENDPOINT = `${API_URL}/Skills`;

export const AdminSkillService = {
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
        return { success: false, error: errorData.error || `HTTP error! status: ${response.status}` };
      }
      const skills: Skill[] = await response.json();
      return { success: true, data: skills };
    } catch (error) {
      console.error('Error fetching all skills:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  addSkill: async (skillData: CreateSkillDto): Promise<ServiceResult<Skill>> => {
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
          const errorData: ApiResult<Skill> = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If parsing fails, use the generic HTTP error
        }
        return { success: false, error: errorMessage };
      }
      const createdSkill: Skill = await response.json();
      return { success: true, data: createdSkill };
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
          errorMessage = errorData.error || errorMessage;
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
          errorMessage = errorData.error || errorMessage;
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
