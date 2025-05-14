import type { ServiceResult } from '../types/ServiceResult'; 
import type { ProfileDto, UpdateProfileDto } from '../types/Profile'; 
import { AuthService } from './AuthService'; 

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to process JSON response and map to ServiceResult
async function _processJsonResponse<T>(responsePromise: Promise<Response>, url: string): Promise<ServiceResult<T>> {
  try {
    const response = await responsePromise;
    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch (e) {
        // If response is not JSON, use text
        errorBody = await response.text();
      }
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
      // Assuming errorBody has a 'message' or is the error message itself
      const errorMessage = (errorBody as any)?.message || (typeof errorBody === 'string' ? errorBody : 'Unknown error');
      return { success: false, error: new Error(errorMessage) };
    }
    const data = await response.json() as T;
    return { success: true, data };
  } catch (error) {
    console.error(`Request failed for URL ${url}:`, error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) }; 
  }
}

export const ProfileService = {
  getProfile: async (profileId: number): Promise<ServiceResult<ProfileDto>> => {
    const url = `${BASE_API_URL}/users/${profileId}`;
    const responsePromise = AuthService.fetchWithAuth(url, { method: 'GET' });
    return _processJsonResponse<ProfileDto>(responsePromise, url);
  },

  getProfileByUserId: async (userId: string): Promise<ServiceResult<ProfileDto>> => {
    const url = `${BASE_API_URL}/users/${userId}`;
    const responsePromise = AuthService.fetchWithAuth(url, { method: 'GET' });
    return _processJsonResponse<ProfileDto>(responsePromise, url);
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
    return _processJsonResponse<{ message: string }>(responsePromise, url);
  },
};
