import type { CreateTutorProfileDto, TutorProfileDto, UpdateTutorProfileDto } from '@/types/TutorProfile';
import { AuthService } from './AuthService';
import type { ServiceResult } from '@/types/api.types';
import { handleApiResponse, getErrorMessageFromResponse } from '../lib/apiUtils';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const TutorProfileService = {
  getTutorProfileByUserId: async (userId: string, suppressErrors = false): Promise<ServiceResult<TutorProfileDto>> => {
    const url = `${BASE_API_URL}/UserBio/user/${userId}`;
    try {
      const response = await AuthService.fetchWithAuth(url, { method: 'GET' });
      if (!response.ok) {
        const { finalErrorMessage, errorBody } = await getErrorMessageFromResponse(response);
        if (!suppressErrors) {
          console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
        }
        // Check if the error is due to profile not found
        if (response.status === 404 || (typeof errorBody === 'string' && errorBody.toLowerCase().includes("user bio not found"))) {
          return { success: false, error: new Error(finalErrorMessage), isNotFoundError: true };
        }
        return { success: false, error: new Error(finalErrorMessage) };
      }
      return await handleApiResponse<TutorProfileDto>(response, url);
    } catch (networkOrOtherError) {
      if (!suppressErrors) {
        console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
      }
      return {
        success: false,
        error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError))
      };
    }
  },

  createTutorProfile: async (payload: CreateTutorProfileDto): Promise<ServiceResult<TutorProfileDto>> => {
    const url = `${BASE_API_URL}/UserBio`;
    try {
      const response = await AuthService.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
      return await handleApiResponse<TutorProfileDto>(response, url);
    } catch (networkOrOtherError) {
      console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
      return {
        success: false,
        error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError))
      };
    }
  },

  updateTutorProfile: async (bioId: number, payload: UpdateTutorProfileDto): Promise<ServiceResult<TutorProfileDto>> => {
    const url = `${BASE_API_URL}/UserBio/${bioId}`;
    try {
      const response = await AuthService.fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
      return await handleApiResponse<TutorProfileDto>(response, url);
    } catch (networkOrOtherError) {
      console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
      return {
        success: false,
        error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError))
      };
    }
  },
};
