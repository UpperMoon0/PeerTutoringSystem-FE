import type { ApiResult } from '../types/ApiResult';
import type { DocumentUploadDto } from '../types/DocumentUploadDto';
import type { FileUploadResponse } from '../types/FileUploadResponse';
import type { RequestTutorPayload } from '../types/RequestTutorPayload';
import type { RequestTutorResponse } from '../types/RequestTutorResponse';
import type { Tutor } from '../types/Tutor';
import type { TutorVerification } from '../types/TutorVerification';
import { mockTutors } from '@/mocks/tutors';
import { AuthService } from './AuthService';
import { processApiResponse } from './ServiceHelpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENABLE_MOCK_API = import.meta.env.VITE_ENABLE_MOCK_API === 'true';

const requestTutor = async (userId: string, payload: RequestTutorPayload): Promise<ApiResult<RequestTutorResponse>> => {
  const url = `${API_BASE_URL}/Users/${userId}/request-tutor`;
  const responsePromise = AuthService.fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  return processApiResponse<RequestTutorResponse>(responsePromise, url); 
};

const uploadDocument = async (file: File, userId: string): Promise<ApiResult<DocumentUploadDto>> => {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/documents/upload?userId=${userId}`;
  const responsePromise = AuthService.fetchWithAuth(url, {
    method: 'POST',
    body: formData,
  });
  
  const result = await processApiResponse<FileUploadResponse>(responsePromise, url);

  if (!result.success) {
    return { success: false, error: result.error };
  }
  const responseData = result.data!;
  return {
    success: true,
    data: {
      documentType: responseData.documentType,
      documentPath: responseData.documentPath,
      fileSize: file.size,
    },
  };
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
    return mockTutors.slice(0, 4);
  } else {
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
  }
};

const getTutorVerifications = async (): Promise<ApiResult<TutorVerification[]>> => {
  const url = `${API_BASE_URL}/TutorVerifications`;
  const responsePromise = AuthService.fetchWithAuth(url, { method: 'GET' });
  return processApiResponse<TutorVerification[]>(responsePromise, url); 
};

const updateTutorVerificationStatus = async (
  verificationId: string,
  status: 'Approved' | 'Rejected',
  adminNotes?: string
): Promise<ApiResult<TutorVerification>> => {
  const url = `${API_BASE_URL}/TutorVerifications/${verificationId}`;
  const responsePromise = AuthService.fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify({ verificationStatus: status, adminNotes }),
    headers: { 'Content-Type': 'application/json' },
  });
  return processApiResponse<TutorVerification>(responsePromise, url); 
};

export const TutorService = {
  requestTutor,
  uploadDocument,
  getFeaturedTutors,
  getTutorVerifications,
  updateTutorVerificationStatus,
};
