import type { RequestTutorPayload } from '../types/RequestTutorPayload';
import type { RequestTutorResponse } from '../types/RequestTutorResponse';
import type { Tutor } from '../types/Tutor';
import type { TutorVerification } from '../types/TutorVerification';
import { AuthService } from './AuthService';
import type { ApiResult } from '@/types/api.types';
import type { DocumentUploadDto, FileUploadResponse } from '@/types/file.types';
import type { PendingTutorVerificationStatus } from '@/types/TutorVerification';
import type { User, ProfileDto } from '@/types/user.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const requestTutor = async (userId: string, payload: RequestTutorPayload): Promise<ApiResult<RequestTutorResponse>> => {
  const url = `${API_BASE_URL}/Users/${userId}/request-tutor`;
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
      let finalErrorMessageApi: string;
      if (typeof errorBody === 'object' && errorBody !== null) {
        if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).message;
        } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).error;
        } else {
          finalErrorMessageApi = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
        }
      } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
        finalErrorMessageApi = errorBody;
      } else {
        finalErrorMessageApi = `Request failed with status ${response.status}`;
      }
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

const uploadDocument = async (file: File, userId: string): Promise<ApiResult<DocumentUploadDto>> => {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/documents/upload?userId=${userId}`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'POST',
      body: formData,
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
      let finalErrorMessageApi: string;
      if (typeof errorBody === 'object' && errorBody !== null) {
        if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).message;
        } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).error;
        } else {
          finalErrorMessageApi = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
        }
      } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
        finalErrorMessageApi = errorBody;
      } else {
        finalErrorMessageApi = `Request failed with status ${response.status}`;
      }
      return { success: false, error: finalErrorMessageApi };
    }

    if (response.status === 204) { 
      return { success: true, data: undefined as unknown as DocumentUploadDto }; 
    }

    const responseText = await response.text();
    if (!responseText) {
        // Similar to 204, how to map an empty successful response to DocumentUploadDto?
        return { success: true, data: undefined as unknown as DocumentUploadDto }; 
    }

    try {
        const fileUploadResponse = JSON.parse(responseText) as FileUploadResponse;
        // Now map FileUploadResponse to DocumentUploadDto
        return {
          success: true,
          data: {
            documentType: fileUploadResponse.documentType,
            documentPath: fileUploadResponse.documentPath,
            fileSize: file.size, // fileSize comes from the input `file` object
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
      const errorBody = await response.text();
      console.error(`API Error ${response.status}: ${response.statusText}`, errorBody);
      return [];
    }
    const data: Tutor[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tutors from real API:", error);
    return [];
  }
};

const getTutorVerifications = async (): Promise<ApiResult<TutorVerification[]>> => {
  const url = `${API_BASE_URL}/TutorVerifications`;
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
      let finalErrorMessageApi: string;
      if (typeof errorBody === 'object' && errorBody !== null) {
        if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).message;
        } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).error;
        } else {
          finalErrorMessageApi = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
        }
      } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
        finalErrorMessageApi = errorBody;
      } else {
        finalErrorMessageApi = `Request failed with status ${response.status}`;
      }
      return { success: false, error: finalErrorMessageApi };
    }
    if (response.status === 204) {
      return { success: true, data: undefined as unknown as TutorVerification[] };
    }
    const responseText = await response.text();
    if (!responseText) {
      return { success: true, data: undefined as unknown as TutorVerification[] };
    }
    try {
      const data = JSON.parse(responseText) as TutorVerification[];
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

const updateTutorVerificationStatus = async (
  verificationId: string,
  status: 'Approved' | 'Rejected',
  adminNotes?: string
): Promise<ApiResult<TutorVerification>> => {
  const url = `${API_BASE_URL}/TutorVerifications/${verificationId}`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify({ verificationStatus: status, adminNotes }),
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
      let finalErrorMessageApi: string;
      if (typeof errorBody === 'object' && errorBody !== null) {
        if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).message;
        } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).error;
        } else {
          finalErrorMessageApi = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
        }
      } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
        finalErrorMessageApi = errorBody;
      } else {
        finalErrorMessageApi = `Request failed with status ${response.status}`;
      }
      return { success: false, error: finalErrorMessageApi };
    }
    if (response.status === 204) {
      return { success: true, data: undefined as unknown as TutorVerification };
    }
    const responseText = await response.text();
    if (!responseText) {
      return { success: true, data: undefined as unknown as TutorVerification };
    }
    try {
      const data = JSON.parse(responseText) as TutorVerification;
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

const checkPendingTutorVerification = async (userId: string): Promise<ApiResult<PendingTutorVerificationStatus>> => {
  const url = `${API_BASE_URL}/TutorVerifications/pending/${userId}`;
  try {
    const response = await AuthService.fetchWithAuth(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}: ${response.statusText}`, errorText);
      return { success: false, error: `Failed to check pending verification. Status: ${response.status}. ${errorText}` };
    }
    if (response.status === 204) {
      return { success: true, data: { hasVerificationRequest: false, latestStatus: null } }; 
    }
    const responseText = await response.text();
    if (!responseText) {
      return { success: true, data: { hasVerificationRequest: false, latestStatus: null } }; 
    }
    try {
      const data = JSON.parse(responseText) as PendingTutorVerificationStatus;
      return { success: true, data };
    } catch (parseError) {
      console.error(`JSON parsing error for URL ${url}:`, parseError, "Response text:", responseText);
      return { success: false, error: "Failed to parse server response." };
    }
  } catch (networkOrOtherError) {
    console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
    const errorString = networkOrOtherError instanceof Error ? networkOrOtherError.message : String(networkOrOtherError);
    return { success: false, error: errorString };
  }
};

const getAllTutors = async (): Promise<ApiResult<User[]>> => {
  const url = `${API_BASE_URL}/Users/tutors`;
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
      let finalErrorMessageApi: string;
      if (typeof errorBody === 'object' && errorBody !== null) {
        if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).message;
        } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).error;
        } else {
          finalErrorMessageApi = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
        }
      } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
        finalErrorMessageApi = errorBody;
      } else {
        finalErrorMessageApi = `Request failed with status ${response.status}`;
      }
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

const getTutorById = async (tutorId: string): Promise<ApiResult<ProfileDto>> => { 
  const url = `${API_BASE_URL}/UserBio/user/${tutorId}`; 
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
      let finalErrorMessageApi: string;
      if (typeof errorBody === 'object' && errorBody !== null) {
        if ('message' in errorBody && typeof (errorBody as any).message === 'string' && (errorBody as any).message.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).message;
        } else if ('error' in errorBody && typeof (errorBody as any).error === 'string' && (errorBody as any).error.trim() !== '') {
          finalErrorMessageApi = (errorBody as any).error;
        } else {
          finalErrorMessageApi = `Request failed with status ${response.status}. Response body: ${JSON.stringify(errorBody)}`;
        }
      } else if (typeof errorBody === 'string' && errorBody.trim() !== '') {
        finalErrorMessageApi = errorBody;
      } else {
        finalErrorMessageApi = `Request failed with status ${response.status}`;
      }
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
  getTutorVerifications,
  updateTutorVerificationStatus,
  checkPendingTutorVerification,
  getAllTutors,
  getTutorById,
};
