import type { CreateTutorProfileDto, TutorProfileDto, UpdateTutorProfileDto } from '@/types/TutorProfile';
import { AuthService } from './AuthService';
import type { ServiceResult } from '@/types/ServiceResult';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const TutorProfileService = {
  getTutorProfileByUserId: async (userId: string): Promise<ServiceResult<TutorProfileDto>> => {
    const url = `${BASE_API_URL}/UserBio/user/${userId}`;
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
        // Check if the error is due to profile not found
        if (response.status === 404 || (typeof errorBody === 'string' && errorBody.toLowerCase().includes("user bio not found"))) {
          return { success: false, error: new Error(finalErrorMessage), isNotFoundError: true };
        }
        return { success: false, error: new Error(finalErrorMessage) };
      }
      if (response.status === 204) {
        return { success: true, data: undefined as unknown as TutorProfileDto };
      }
      const responseText = await response.text();
      if (!responseText) {
        return { success: true, data: undefined as unknown as TutorProfileDto };
      }
      try {
        const data = JSON.parse(responseText) as TutorProfileDto;
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

  createTutorProfile: async (payload: CreateTutorProfileDto): Promise<ServiceResult<TutorProfileDto>> => {
    const url = `${BASE_API_URL}/UserBio`;
    try {
      const response = await AuthService.fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
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
        return { success: true, data: undefined as unknown as TutorProfileDto };
      }
      const responseText = await response.text();
      if (!responseText) {
        return { success: true, data: undefined as unknown as TutorProfileDto };
      }
      try {
        const data = JSON.parse(responseText) as TutorProfileDto;
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

  updateTutorProfile: async (bioId: number, payload: UpdateTutorProfileDto): Promise<ServiceResult<TutorProfileDto>> => {
    const url = `${BASE_API_URL}/UserBio/${bioId}`;
    try {
      const response = await AuthService.fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
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
        return { success: true, data: undefined as unknown as TutorProfileDto };
      }
      const responseText = await response.text();
      if (!responseText) {
        return { success: true, data: undefined as unknown as TutorProfileDto };
      }
      try {
        const data = JSON.parse(responseText) as TutorProfileDto;
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
