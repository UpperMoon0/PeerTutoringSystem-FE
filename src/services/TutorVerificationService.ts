import type { ApiResult } from '@/types/api.types';
import type { TutorVerification } from '../types/TutorVerification';
import { AuthService } from './AuthService';
import type { PendingTutorVerificationStatus } from '@/types/TutorVerification';

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

const getTutorVerifications = async (): Promise<ApiResult<TutorVerification[]>> => {
  const url = `${API_BASE_URL}/TutorVerifications`;
  try {
    const response = await AuthService.fetchWithAuth(url, { method: 'GET' });
    if (!response.ok) {
      const errorBody = await getErrorBody(response);
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
      const finalErrorMessageApi = extractErrorMessage(errorBody, response.status);
      return { success: false, error: finalErrorMessageApi };
    }
    if (response.status === 204) {
      return { success: true, data: [] };
    }
    const responseText = await response.text();
    if (!responseText) {
      return { success: true, data: [] };
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
      const errorBody = await getErrorBody(response);
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
      const finalErrorMessageApi = extractErrorMessage(errorBody, response.status);
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

const downloadDocument = async (documentId: string): Promise<ApiResult<null>> => {
  const url = `${API_BASE_URL}/TutorVerifications/document/${documentId}`;
  try {
    const response = await AuthService.fetchWithAuth(url, { method: 'GET' });
    if (!response.ok) {
      const errorBody = await getErrorBody(response);
      console.error(`API Error ${response.status} for URL ${url}:`, errorBody);
      const finalErrorMessageApi = extractErrorMessage(errorBody, response.status);
      return { success: false, error: finalErrorMessageApi };
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'downloaded-file';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, data: null };
  } catch (networkOrOtherError) {
    console.error(`Request processing failed for URL ${url}:`, networkOrOtherError);
    const errorString = networkOrOtherError instanceof Error ? networkOrOtherError.message : String(networkOrOtherError);
    return {
      success: false,
      error: errorString
    };
  }
};

export const TutorVerificationService = {
  getTutorVerifications,
  updateTutorVerificationStatus,
  checkPendingTutorVerification,
  downloadDocument,
};