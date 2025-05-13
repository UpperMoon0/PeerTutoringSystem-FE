const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7038/api';

interface DocumentUploadDto {
  documentType: string;
  documentPath: string;
  fileSize: number;
}

export interface RequestTutorPayload {
  citizenId: string;
  studentId: string;
  university: string;
  major: string;
  documents: DocumentUploadDto[];
}

export interface RequestTutorResponse {
  verificationID: string;
  message: string;
}

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

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

interface FileUploadResponse {
  documentPath: string;
  documentType: string; 
  fileSize: number;    
  userID: string;    
}

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
        documentType: file.type || 'application/octet-stream',
        documentPath: result.documentPath,                  
        fileSize: file.size,                                 
      },
    };
  } catch (error: any) {
    console.error('Network or other error in uploadDocument:', error);
    return { success: false, error: error.message || 'An unexpected network error occurred during document upload.' };
  }
};

export const TutorService = {
  requestTutor,
  uploadDocument,
};
