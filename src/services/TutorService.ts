import type { RequestTutorPayload } from '../types/RequestTutorPayload';
import type { RequestTutorResponse } from '../types/RequestTutorResponse';
import type { Tutor } from '../types/Tutor';
import { AuthService } from './AuthService';
import type { ApiResult } from '@/types/api.types';
import type { DocumentUploadDto, FileUploadResponse } from '@/types/file.types';
import type { User, ProfileDto } from '@/types/user.types';
import type { EnrichedTutor } from '@/types/enrichedTutor.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper type for error response objects
interface ErrorResponse {
  message?: string;
  error?: string;
}

// Helper function to extract error message from response
const extractErrorMessage = (errorBody: unknown, status: number): string => {
  if (typeof errorBody === 'object' && errorBody !== null) {
    const errorObj = errorBody as ErrorResponse;
    if (errorObj.message && typeof errorObj.message === 'string' && errorObj.message.trim() !== '') {
      return errorObj.message;
    } else if (errorObj.error && typeof errorObj.error === 'string' && errorObj.error.trim() !== '') {
      return errorObj.error;
    } else {
      return `Request failed with status ${status}. Response body: ${JSON.stringify(errorBody)}`;
    }
  } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
    return errorBody;
  } else {
    return `Request failed with status ${status}`;
  }
};

// Helper function to get error body from response
const getErrorBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return `Request failed with status ${response.status} and error body could not be read.`;
    }
  }
};

const requestTutor = async (payload: RequestTutorPayload): Promise<ApiResult<RequestTutorResponse>> => {
  const url = `${API_BASE_URL}/TutorVerifications/request`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorBody = await getErrorBody(response);
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
      const finalErrorMessageApi = extractErrorMessage(errorBody, response.status);
      return { success: false, error: finalErrorMessageApi };
    }
    if (response.status === 204) {
      return { success: true, data: undefined as unknown as RequestTutorResponse };
    }
    const responseText = await response.text();
    if (!responseText) {
      return { success: true, data: undefined as unknown as RequestTutorResponse };
    }
    try {
      const data = JSON.parse(responseText) as RequestTutorResponse;
      return { success: true, data };
    } catch (parseError) {
      console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
      return { success: false, error: "Failed to parse server response." };
    }
  } catch (networkOrOtherError) {
    console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
    const errorString = networkOrOtherError instanceof Error ? networkOrOtherError.message : String(networkOrOtherError);
    return {
      success: false,
      error: errorString
    };
  }
};

const uploadDocument = async (file: File): Promise<ApiResult<DocumentUploadDto>> => {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/Documents/upload`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorBody = await getErrorBody(response);
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
      const finalErrorMessageApi = extractErrorMessage(errorBody, response.status);
      return { success: false, error: finalErrorMessageApi };
    }

    if (response.status === 204) {
      return { success: true, data: undefined as unknown as DocumentUploadDto };
    }

    const responseText = await response.text();
    if (!responseText) {
      return { success: true, data: undefined as unknown as DocumentUploadDto };
    }

    try {
      const fileUploadResponse = JSON.parse(responseText) as FileUploadResponse;
      return {
        success: true,
        data: {
          documentType: fileUploadResponse.documentType,
          documentPath: fileUploadResponse.documentPath,
          fileSize: file.size,
        },
      };
    } catch (parseError) {
      console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
      return { success: false, error: "Failed to parse server response." };
    }

  } catch (networkOrOtherError) {
    console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
    const errorString = networkOrOtherError instanceof Error ? networkOrOtherError.message : String(networkOrOtherError);
    return {
      success: false,
      error: errorString
    };
  }
};

const getFeaturedTutors = async (searchTerm?: string): Promise<Tutor[]> => {
  console.log(`[Real API] Fetching featured tutors. Search term: ${searchTerm}`);
  try {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    const response = await fetch(`${API_BASE_URL}/tutors/featured${query}`);

    if (!response.ok) {
      // Suppress 404 errors for featured tutors as this endpoint might not be implemented
      if (response.status !== 404) {
        const errorBody = await response.text();
        console.error(`API Error ${response.status}: ${response.statusText}`, errorBody);
      }
      return [];
    }
    const data: Tutor[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tutors from real API:", error);
    return [];
  }
};


const getAllTutors = async (): Promise<ApiResult<User[]>> => {
  const url = `${API_BASE_URL}/Users/tutors`;
  try {
    // Use regular fetch instead of fetchWithAuth to allow guest access
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      const errorBody = await getErrorBody(response);
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
      const finalErrorMessageApi = extractErrorMessage(errorBody, response.status);
      return { success: false, error: finalErrorMessageApi };
    }

    const data = await response.json() as User[];
    return { success: true, data };
  } catch (networkOrOtherError) {
    console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
    const errorString = networkOrOtherError instanceof Error ? networkOrOtherError.message : String(networkOrOtherError);
    return {
      success: false,
      error: errorString
    };
  }
};

const getAllEnrichedTutors = async (): Promise<ApiResult<EnrichedTutor[]>> => {
  const url = `${API_BASE_URL}/tutors/enriched-list`;
  try {
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      const errorBody = await getErrorBody(response);
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
      const finalErrorMessageApi = extractErrorMessage(errorBody, response.status);
      return { success: false, error: finalErrorMessageApi };
    }

    const data = await response.json() as EnrichedTutor[];
    return { success: true, data };
  } catch (networkOrOtherError) {
    console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
    const errorString = networkOrOtherError instanceof Error ? networkOrOtherError.message : String(networkOrOtherError);
    return {
      success: false,
      error: errorString
    };
  }
};

const getTutorById = async (tutorId: string): Promise<ApiResult<ProfileDto>> => {
  const url = `${API_BASE_URL}/tutors/enriched/${tutorId}`;
  try {
    // Use regular fetch instead of fetchWithAuth to allow guest access
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      const errorBody = await getErrorBody(response);
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
      const finalErrorMessageApi = extractErrorMessage(errorBody, response.status);
      return { success: false, error: finalErrorMessageApi };
    }
    if (response.status === 204) {
      return { success: true, data: undefined as unknown as ProfileDto };
    }
    const responseText = await response.text();
    if (!responseText) {
      return { success: true, data: undefined as unknown as ProfileDto };
    }
    try {
      const data = JSON.parse(responseText) as ProfileDto;
      return { success: true, data };
    } catch (parseError) {
      console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
      return { success: false, error: "Failed to parse server response." };
    }
  } catch (networkOrOtherError) {
    console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
    const errorString = networkOrOtherError instanceof Error ? networkOrOtherError.message : String(networkOrOtherError);
    return {
      success: false,
      error: errorString
    };
  }
};

export const TutorService = {
  requestTutor,
  uploadDocument,
  getFeaturedTutors,
  getAllTutors,
  getAllEnrichedTutors,
  getTutorById,
};