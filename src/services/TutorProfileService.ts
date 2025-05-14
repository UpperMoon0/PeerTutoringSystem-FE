import type { CreateTutorProfileDto, TutorProfileDto, UpdateTutorProfileDto } from '@/types/TutorProfile';
import { AuthService } from './AuthService';
import { processServiceResponse } from './ServiceHelpers';
import type { ServiceResult } from '@/types/ServiceResult';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const TutorProfileService = {
  getTutorProfileByUserId: async (userId: string): Promise<ServiceResult<TutorProfileDto>> => {
    const url = `${BASE_API_URL}/profiles/user/${userId}`;
    const responsePromise = AuthService.fetchWithAuth(url, { method: 'GET' });
    return processServiceResponse<TutorProfileDto>(responsePromise, url);
  },

  createTutorProfile: async (payload: CreateTutorProfileDto): Promise<ServiceResult<TutorProfileDto>> => {
    const url = `${BASE_API_URL}/profiles`;
    const responsePromise = AuthService.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    return processServiceResponse<TutorProfileDto>(responsePromise, url);
  },

  updateTutorProfile: async (profileId: number, payload: UpdateTutorProfileDto): Promise<ServiceResult<TutorProfileDto>> => {
    const url = `${BASE_API_URL}/profiles/${profileId}`;
    const responsePromise = AuthService.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    return processServiceResponse<TutorProfileDto>(responsePromise, url);
  },
};
