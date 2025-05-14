import type { ServiceResult } from '../types/ServiceResult'; 
import type { ProfileDto, CreateProfileDto, UpdateProfileDto } from '../types/Profile'; 
import { AuthService } from './AuthService'; 

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const ProfileService = {
  createProfile: async (payload: CreateProfileDto): Promise<ServiceResult<ProfileDto>> => {
    return AuthService.authenticatedRequest<ProfileDto>(`${
    BASE_API_URL}/profiles`, 'POST', payload);
  },

  getProfile: async (profileId: number): Promise<ServiceResult<ProfileDto>> => {
    return AuthService.authenticatedRequest<ProfileDto>(`${
    BASE_API_URL}/profiles/${profileId}`, 'GET');
  },

  getProfileByUserId: async (userId: string): Promise<ServiceResult<ProfileDto>> => {
    return AuthService.authenticatedRequest<ProfileDto>(`${
    BASE_API_URL}/profiles/user/${userId}`, 'GET');
  },

  updateProfile: async (profileId: number, payload: UpdateProfileDto): Promise<ServiceResult<{ message: string }>> => {
    return AuthService.authenticatedRequest<{ message: string }>(`${
    BASE_API_URL}/profiles/${profileId}`, 'PUT', payload);
  },
};
