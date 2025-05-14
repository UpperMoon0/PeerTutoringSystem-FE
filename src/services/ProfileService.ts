import type { ServiceResult } from '../types/ServiceResult'; 
import type { ProfileDto, UpdateProfileDto } from '../types/Profile'; 
import { AuthService } from './AuthService'; 

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const ProfileService = {
  getProfile: async (profileId: number): Promise<ServiceResult<ProfileDto>> => {
    const url = `${BASE_API_URL}/users/${profileId}`;
    try {
      const response = await AuthService.fetchWithAuth(url, { method: 'GET' });
      if (!response.ok) {
        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch (e) {
          try {
            errorBody = await response.text();
          } catch (textError) {
            errorBody = `Request failed with status ${response.status} and error body could not be read.`;
          }
        }
        console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
        let finalErrorMessage: string;
        if (typeof errorBody === 'object' && errorBody !== null) {
          if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
            finalErrorMessage = (errorBody as any).message;
          } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
            finalErrorMessage = (errorBody as any).error;
          } else {
            finalErrorMessage = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
          }
        } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
          finalErrorMessage = errorBody;
        } else {
          finalErrorMessage = `Request failed with status ${response.status}`;
        }
        return { success: false, error: new Error(finalErrorMessage) };
      }
      if (response.status === 204) {
        return { success: true, data: undefined as unknown as ProfileDto };
      }
      const responseText = await response.text();
      if (!responseText) { // Check if body is empty for non-204 success (e.g. 200 with empty body)
        return { success: true, data: undefined as unknown as ProfileDto };
      }
      try {
        const data = JSON.parse(responseText) as ProfileDto;
        return { success: true, data };
      } catch (parseError) {
        console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
        return { success: false, error: new Error("Failed to parse server response.") };
      }
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
      if (!response.ok) {
        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch (e) {
          try {
            errorBody = await response.text();
          } catch (textError) {
            errorBody = `Request failed with status ${response.status} and error body could not be read.`;
          }
        }
        console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
        let finalErrorMessage: string;
        if (typeof errorBody === 'object' && errorBody !== null) {
          if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
            finalErrorMessage = (errorBody as any).message;
          } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
            finalErrorMessage = (errorBody as any).error;
          } else {
            finalErrorMessage = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
          }
        } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
          finalErrorMessage = errorBody;
        } else {
          finalErrorMessage = `Request failed with status ${response.status}`;
        }
        return { success: false, error: new Error(finalErrorMessage) };
      }
      if (response.status === 204) {
        return { success: true, data: undefined as unknown as ProfileDto };
      }
      const responseText = await response.text();
      if (!responseText) { // Check if body is empty for non-204 success
        return { success: true, data: undefined as unknown as ProfileDto };
      }
      try {
        const data = JSON.parse(responseText) as ProfileDto;
        return { success: true, data };
      } catch (parseError) {
        console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
        return { success: false, error: new Error("Failed to parse server response.") };
      }
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
      let response: Response;
      if (payload.avatar && payload.avatar instanceof File) {
        const formData = new FormData();
        formData.append('fullName', payload.fullName);
        formData.append('email', payload.email);
        formData.append('dateOfBirth', payload.dateOfBirth);
        formData.append('phoneNumber', payload.phoneNumber);
        formData.append('gender', payload.gender);
        formData.append('hometown', payload.hometown);
        formData.append('avatar', payload.avatar);
        response = await AuthService.fetchWithAuth(url, { method: 'PUT', body: formData });
      } else {
        const { avatar, ...restPayload } = payload;
        response = await AuthService.fetchWithAuth(url, {
          method: 'PUT',
          body: JSON.stringify(restPayload),
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!response.ok) {
        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch (e) {
          try {
            errorBody = await response.text();
          } catch (textError) {
            errorBody = `Request failed with status ${response.status} and error body could not be read.`;
          }
        }
        console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
        let finalErrorMessage: string;
        if (typeof errorBody === 'object' && errorBody !== null) {
          if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
            finalErrorMessage = (errorBody as any).message;
          } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
            finalErrorMessage = (errorBody as any).error;
          } else {
            finalErrorMessage = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
          }
        } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
          finalErrorMessage = errorBody;
        } else {
          finalErrorMessage = `Request failed with status ${response.status}`;
        }
        return { success: false, error: new Error(finalErrorMessage) };
      }
      if (response.status === 204) {
        return { success: true, data: undefined as unknown as { message: string } };
      }
      const responseText = await response.text();
      if (!responseText) { // Check if body is empty for non-204 success
        return { success: true, data: undefined as unknown as { message: string } };
      }
      try {
        const data = JSON.parse(responseText) as { message: string };
        return { success: true, data };
      } catch (parseError) {
        console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
        return { success: false, error: new Error("Failed to parse server response.") };
      }
    } catch (networkOrOtherError) {
      console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
      return {
        success: false,
        error: networkOrOtherError instanceof Error ? networkOrOtherError : new Error(String(networkOrOtherError))
      };
    }
  },
};
