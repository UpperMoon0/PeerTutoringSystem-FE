import type { TutorAvailability, CreateTutorAvailability } from '@/types/tutorAvailability.types';
import type { ServiceResult } from '@/types/api.types';
import { AuthService } from './AuthService';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
const TUTOR_AVAILABILITY_API_URL = `${BASE_API_URL}/TutorAvailability`;

export const TutorAvailabilityService = {
  addAvailability: async (availabilityData: CreateTutorAvailability): Promise<ServiceResult<TutorAvailability>> => {
    try {
      const response = await AuthService.fetchWithAuth(TUTOR_AVAILABILITY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(availabilityData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to add availability.' };
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error adding availability:', error);
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  },

  getTutorAvailability: async (tutorId: string, page: number = 1, pageSize: number = 10): Promise<ServiceResult<{ availabilities: TutorAvailability[], totalCount: number }>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${TUTOR_AVAILABILITY_API_URL}/tutor/${tutorId}?page=${page}&pageSize=${pageSize}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to fetch tutor availability.' };
      }

      const data = await response.json();
      return { success: true, data: { availabilities: data.data, totalCount: data.totalCount } };
    } catch (error) {
      console.error('Error fetching tutor availability:', error);
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  },

  getAvailableSlots: async (tutorId: string, startDate: string, endDate: string, page: number = 1, pageSize: number = 10): Promise<ServiceResult<{ availabilities: TutorAvailability[], totalCount: number }>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${TUTOR_AVAILABILITY_API_URL}/available?tutorId=${tutorId}&startDate=${startDate}&endDate=${endDate}&page=${page}&pageSize=${pageSize}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to fetch available slots.' };
      }
      const data = await response.json();
      return { success: true, data: { availabilities: data.data, totalCount: data.totalCount } };
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  },
};
