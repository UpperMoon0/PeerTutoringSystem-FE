import type { ApiResult } from '../types/ApiResult';
import type { DocumentUploadDto } from '../types/DocumentUploadDto';
import type { FileUploadResponse } from '../types/FileUploadResponse';
import type { RequestTutorPayload } from '../types/RequestTutorPayload';
import type { RequestTutorResponse } from '../types/RequestTutorResponse';
import type { Tutor } from '../types/Tutor';
import type { TutorVerification } from '../types/TutorVerification';
import { mockTutors } from '@/mocks/tutors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENABLE_MOCK_API = import.meta.env.VITE_ENABLE_MOCK_API === 'true';

const requestTutor = async (userId: string, payload: RequestTutorPayload): Promise<ApiResult<RequestTutorResponse>> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return { success: false, error: 'No access token found. Please log in.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Users/${userId}/request-tutor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to submit request. Invalid response from server.' }));
      console.error('Request tutor error:', errorData);
      return { success: false, error: errorData.error || `Request failed with status ${response.status}` };
    }

    const data: RequestTutorResponse = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('Network or other error in requestTutor:', error);
    return { success: false, error: error.message || 'An unexpected network error occurred.' };
  }
};

const uploadDocument = async (file: File, userId: string): Promise<ApiResult<DocumentUploadDto>> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return { success: false, error: 'No access token found. Please log in.' };
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/documents/upload?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to upload document. Invalid response from server.' }));
      console.error('Document upload error:', errorData);
      return { success: false, error: errorData.error || `Upload failed with status ${response.status}` };
    }

    const result: FileUploadResponse = await response.json();

    return {
      success: true,
      data: {
        documentType: result.documentType,
        documentPath: result.documentPath,
        fileSize: file.size,
      },
    };
  } catch (error: any) {
    console.error('Network or other error in uploadDocument:', error);
    return { success: false, error: error.message || 'An unexpected network error occurred during document upload.' };
  }
};

const getFeaturedTutors = async (searchTerm?: string): Promise<Tutor[]> => {
  if (ENABLE_MOCK_API) {
    console.log(`[Mock API] Fetching featured tutors. Search term: ${searchTerm}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return mockTutors.filter(tutor =>
        tutor.name.toLowerCase().includes(lowerSearchTerm) ||
        tutor.courses.toLowerCase().includes(lowerSearchTerm) ||
        tutor.tutoringInfo.some(info => info.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return mockTutors.slice(0, 4); // Return a slice of mock tutors or all if less than 4
  } else {
    console.log(`[Real API] Fetching featured tutors. Search term: ${searchTerm}`);
    try {
      // TODO: Update the endpoint when available
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`${API_BASE_URL}/tutors/featured${query}`);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error ${response.status}: ${response.statusText}`, errorBody);
        return []; // Return empty list on error
      }

      const data: Tutor[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching tutors from real API:", error);
      return []; // Return an empty list on error
    }
  }
};

const getTutorVerifications = async (): Promise<ApiResult<TutorVerification[]>> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return { success: false, error: 'No access token found. Please log in.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/TutorVerifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch tutor verifications. Invalid response from server.' }));
      console.error('Get tutor verifications error:', errorData);
      return { success: false, error: errorData.error || `Request failed with status ${response.status}` };
    }

    const data: TutorVerification[] = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('Network or other error in getTutorVerifications:', error);
    return { success: false, error: error.message || 'An unexpected network error occurred.' };
  }
};

const updateTutorVerificationStatus = async (
  verificationId: string,
  status: 'Approved' | 'Rejected',
  adminNotes?: string
): Promise<ApiResult<TutorVerification>> => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return { success: false, error: 'No access token found. Please log in.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/TutorVerifications/${verificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ verificationStatus: status, adminNotes }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update tutor verification status. Invalid response from server.' }));
      console.error('Update tutor verification status error:', errorData);
      return { success: false, error: errorData.error || `Request failed with status ${response.status}` };
    }

    const data: TutorVerification = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('Network or other error in updateTutorVerificationStatus:', error);
    return { success: false, error: error.message || 'An unexpected network error occurred.' };
  }
};

export const TutorService = {
  requestTutor,
  uploadDocument,
  getFeaturedTutors,
  getTutorVerifications,
  updateTutorVerificationStatus,
};
