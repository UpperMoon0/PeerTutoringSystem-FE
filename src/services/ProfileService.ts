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
    // If payload.avatar is a File, use FormData
    if (payload.avatar && payload.avatar instanceof File) {
      const formData = new FormData();
      formData.append('fullName', payload.fullName);
      formData.append('email', payload.email);
      formData.append('dateOfBirth', payload.dateOfBirth);
      formData.append('phoneNumber', payload.phoneNumber);
      formData.append('gender', payload.gender);
      formData.append('hometown', payload.hometown);
      formData.append('avatar', payload.avatar);
      
      // When sending FormData, the Content-Type header is set automatically by the browser
      // So, we might need a different version of authenticatedRequest or adjust it
      // For now, assuming AuthService.authenticatedRequest can handle FormData if headers are not manually set to application/json
      return AuthService.authenticatedRequest<{ message: string }>(`${BASE_API_URL}/users/${userId}`, 'PUT', formData);
    } else {
      // If no avatar or avatar is not a file (e.g. null or already a URL string if backend supports it differently)
      // Send as JSON, removing avatar if it's null to avoid sending empty field if backend expects it to be omitted
      const { avatar, ...restPayload } = payload;
      return AuthService.authenticatedRequest<{ message: string }>(`${BASE_API_URL}/users/${userId}`, 'PUT', restPayload);
    }
  },
};
