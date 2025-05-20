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
      // The GetAll endpoint in SkillsController returns Ok(skills) which is directly the array.
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
      // The Add endpoint returns Ok(new { SkillID = skill.SkillID });
      // It should ideally return the created skill object directly for consistency.
      // Assuming for now it returns the full skill object as per ServiceResult<Skill>
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
          const errorData: ApiResult<null> = await response.json(); // Error response might have a body
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
      return { success: true, data: null }; // Delete typically returns 204 No Content or 200 OK with a success message
    } catch (error) {
      console.error(`Error deleting skill ${skillId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },
};
