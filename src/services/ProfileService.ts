import type { ServiceResult } from '../types/ServiceResult'; 
import type { ProfileDto, UpdateProfileDto } from '../types/Profile'; 
import { AuthService } from './AuthService'; 
import { processServiceResponse } from './ServiceHelpers'; // Import the shared helper

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const ProfileService = {
  getProfile: async (profileId: number): Promise<ServiceResult<ProfileDto>> => {
    const url = `${BASE_API_URL}/users/${profileId}`;
    const responsePromise = AuthService.fetchWithAuth(url, { method: 'GET' });
    return processServiceResponse<ProfileDto>(responsePromise, url); // Use shared helper
  },

  getProfileByUserId: async (userId: string): Promise<ServiceResult<ProfileDto>> => {
    const url = `${BASE_API_URL}/users/${userId}`;
    const responsePromise = AuthService.fetchWithAuth(url, { method: 'GET' });
    return processServiceResponse<ProfileDto>(responsePromise, url); // Use shared helper
  },

  updateProfile: async (userId: string, payload: UpdateProfileDto): Promise<ServiceResult<{ message: string }>> => {
    const url = `${BASE_API_URL}/users/${userId}`;
    let responsePromise: Promise<Response>;

    if (payload.avatar && payload.avatar instanceof File) {
      const formData = new FormData();
      formData.append('fullName', payload.fullName);
      formData.append('email', payload.email);
      formData.append('dateOfBirth', payload.dateOfBirth);
      formData.append('phoneNumber', payload.phoneNumber);
      formData.append('gender', payload.gender);
      formData.append('hometown', payload.hometown);
      formData.append('avatar', payload.avatar);
      
      responsePromise = AuthService.fetchWithAuth(url, { method: 'PUT', body: formData });
    } else {
      const { avatar, ...restPayload } = payload;
      responsePromise = AuthService.fetchWithAuth(url, { 
        method: 'PUT', 
        body: JSON.stringify(restPayload),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return processServiceResponse<{ message: string }>(responsePromise, url); // Use shared helper
  },
};
