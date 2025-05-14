import type { ApiResult } from '../types/ApiResult';
import type { DocumentUploadDto } from '../types/DocumentUploadDto';
import type { FileUploadResponse } from '../types/FileUploadResponse';
import type { RequestTutorPayload } from '../types/RequestTutorPayload';
import type { RequestTutorResponse } from '../types/RequestTutorResponse';
import type { Tutor } from '../types/Tutor';
import type { TutorVerification } from '../types/TutorVerification';
import { mockTutors } from '@/mocks/tutors';
import { AuthService, _fetchWithAuthCore, _processJsonResponse } from './AuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENABLE_MOCK_API = import.meta.env.VITE_ENABLE_MOCK_API === 'true';

const requestTutor = async (userId: string, payload: RequestTutorPayload): Promise<ApiResult<RequestTutorResponse>> => {
  const result = await AuthService.authenticatedRequest<RequestTutorResponse>(
    `${API_BASE_URL}/Users/${userId}/request-tutor`,
    'POST',
    payload
  );
  if (!result.success) {
    return { success: false, error: result.error instanceof Error ? result.error.message : String(result.error) };
  }
  return { success: true, data: result.data! }; 
};

const uploadDocument = async (file: File, userId: string): Promise<ApiResult<DocumentUploadDto>> => {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/documents/upload?userId=${userId}`;
  const requestOptions: RequestInit = {
    method: 'POST',
    body: formData,
  };

  // Use the core fetch logic with auth handling and response processing for FormData
  const responsePromise = _fetchWithAuthCore(url, requestOptions);
  const result = await _processJsonResponse<FileUploadResponse>(responsePromise, url);

  if (!result.success) {
    console.error('Document upload error:', result.error);
    return { success: false, error: result.error instanceof Error ? result.error.message : String(result.error) };
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
  const result = await AuthService.authenticatedRequest<TutorVerification[]>(
    `${API_BASE_URL}/TutorVerifications`,
    'GET'
  );

  if (!result.success) {
    const errorMessage = result.error instanceof Error ? result.error.message : String(result.error);
    console.error('Get tutor verifications error:', errorMessage);
    return { success: false, error: errorMessage };
  }
  return { success: true, data: result.data! }; 
};

const updateTutorVerificationStatus = async (
  verificationId: string,
  status: 'Approved' | 'Rejected',
  adminNotes?: string
): Promise<ApiResult<TutorVerification>> => {
  const result = await AuthService.authenticatedRequest<TutorVerification>(
    `${API_BASE_URL}/TutorVerifications/${verificationId}`,
    'PUT',
    { verificationStatus: status, adminNotes }
  );
  if (!result.success) {
    return { success: false, error: result.error instanceof Error ? result.error.message : String(result.error) };
  }
  return { success: true, data: result.data! };
};

export const TutorService = {
  requestTutor,
  uploadDocument,
  getFeaturedTutors,
  getTutorVerifications,
  updateTutorVerificationStatus,
};
