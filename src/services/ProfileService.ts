import type { ServiceResult } from '../types/ServiceResult'; 
import type { ProfileDto, UpdateProfileDto } from '../types/Profile'; 
import { AuthService } from './AuthService'; 

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const ProfileService = {
  getProfile: async (profileId: number): Promise<ServiceResult<ProfileDto>> => {
    return AuthService.authenticatedRequest<ProfileDto>(`${
    BASE_API_URL}/users/${profileId}`, 'GET');
  },

  getProfileByUserId: async (userId: string): Promise<ServiceResult<ProfileDto>> => {
    return AuthService.authenticatedRequest<ProfileDto>(`${BASE_API_URL}/users/${userId}`, 'GET');
  },

  updateProfile: async (userId: string, payload: UpdateProfileDto): Promise<ServiceResult<{ message: string }>> => {
    return AuthService.authenticatedRequest<{ message: string }>(`${BASE_API_URL}/users/${userId}`, 'PUT', payload);
  },
};
