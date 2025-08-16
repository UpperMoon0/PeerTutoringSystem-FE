import type { ProfileDto, UpdateProfileDto, User } from '@/types/user.types';
import type { ServiceResult } from '@/types/api.types';
import { AuthService } from './AuthService';
import { handleApiResponse } from '../lib/apiUtils';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const ProfileService = {
  getProfile: async (profileId: number): Promise<ServiceResult<ProfileDto>> => {
    const url = `${BASE_API_URL}/users/${profileId}`;
    try {
      const response = await AuthService.fetchWithAuth(url, { method: 'GET' });
      return await handleApiResponse<ProfileDto>(response, url);
    } catch (networkOrOtherError) {
      console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
      return {
        success: false,
        error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError))
      };
    }
  },

  getProfileByUserId: async (userId: string): Promise<ServiceResult<ProfileDto>> => {
    const url = `${BASE_API_URL}/users/${userId}`;
    try {
      const response = await AuthService.fetchWithAuth(url, { method: 'GET' });
      return await handleApiResponse<ProfileDto>(response, url);
    } catch (networkOrOtherError) {
      console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
      return {
        success: false,
        error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError))
      };
    }
  },

  getUserAccountById: async (userId: string): Promise<ServiceResult<User>> => {
    const url = `${BASE_API_URL}/users/${userId}`;
    try {
      const response = await AuthService.fetchWithAuth(url, { method: 'GET' });
      if (response.status === 204) { // Should not happen for getUserById if user exists
        return { success: false, error: new Error('User not found.') };
      }
      const result = await handleApiResponse<User>(response, url);
      if (result.success && result.data === undefined) {
          return { success: false, error: new Error('Empty response from server.') };
      }
      return result;
    } catch (networkOrOtherError) {
      console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
      return {
        success: false,
        error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError))
      };
    }
  },

  updateProfile: async (userId: string, payload: UpdateProfileDto): Promise<ServiceResult<{ message: string }>> => {
    const url = `${BASE_API_URL}/users/${userId}`;
    try {
      const formData = new FormData();
      formData.append('fullName', payload.fullName);
      formData.append('email', payload.email);
      formData.append('dateOfBirth', payload.dateOfBirth);
      formData.append('phoneNumber', payload.phoneNumber);
      formData.append('gender', payload.gender);
      formData.append('hometown', payload.hometown);
      if (payload.avatar && payload.avatar instanceof File) {
        formData.append('avatar', payload.avatar);
      }

      const response = await AuthService.fetchWithAuth(url, {
        method: 'PUT',
        body: formData,
      });

      return await handleApiResponse<{ message: string }>(response, url);
    } catch (networkOrOtherError) {
      console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
      return {
        success: false,
        error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError)),
      };
    }
  },
};
