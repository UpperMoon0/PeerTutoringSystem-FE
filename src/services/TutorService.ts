import type { ApiResult } from '../types/ApiResult';
import type { DocumentUploadDto } from '../types/DocumentUploadDto';
import type { FileUploadResponse } from '../types/FileUploadResponse';
import type { RequestTutorPayload } from '../types/RequestTutorPayload';
import type { RequestTutorResponse } from '../types/RequestTutorResponse';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7038/api';

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

// Placeholder for getFeaturedTutors
// TODO: Implement actual logic to fetch featured tutors from the backend
const getFeaturedTutors = async (): Promise<ApiResult<any[]>> => { 
  console.warn('getFeaturedTutors is a placeholder and needs to be implemented.');
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return mock data or an empty array. Replace with actual data fetching.
  // For now, I use the mock tutors if available, otherwise an empty array.
  try {
    const { mockTutors } = await import('../mocks/tutors');
    return { success: true, data: mockTutors.slice(0, 4) }; 
  } catch (e) {
    console.error("Could not load mock tutors for placeholder function", e);
    return { success: true, data: [] }; 
  }
};

export const TutorService = {
  requestTutor,
  uploadDocument,
  getFeaturedTutors,
};
