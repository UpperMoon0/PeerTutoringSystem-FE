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
      // BE returns { skillID: "guid" } upon successful creation
      const responseData: { skillID: string } = await response.json();
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error adding skill:', error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },

  updateSkill: async (skillId: string, skillData: UpdateSkillDto): Promise<ServiceResult<Skill>> => {
    try {
      // Ensure skillData includes skillID for the PUT request body as per BE SkillDto
      const response = await AuthService.fetchWithAuth(`${SKILLS_ENDPOINT}/${skillId}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillData), // skillData now includes skillID
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
      // Assuming the backend returns the updated skill object directly, not nested in a data property.
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
      // Delete typically returns 204 No Content or similar, with no body or a success message.
      // Returning null as per the original FE service design.
      return { success: true, data: null };
    } catch (error) {
      console.error(`Error deleting skill ${skillId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  },
};
