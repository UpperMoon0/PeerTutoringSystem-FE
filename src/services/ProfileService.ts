import type { ApiResult } from '../types/ApiResult';
import type { ProfileDto, CreateProfileDto, UpdateProfileDto } from '../types/Profile'; 

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

async function authFetch<T>(url: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      return { success: false, error: errorData.message || `API request failed with status ${response.status}` };
    }

    // For 204 No Content, we might not have a body
    if (response.status === 204) {
      return { success: true, data: null as unknown as T }; // Or handle as appropriate
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API request error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

const authGet = <T>(url: string): Promise<ApiResult<T>> => {
  return authFetch<T>(url, { method: 'GET' });
};

const authPost = <T_Response, T_Payload = unknown>(url: string, payload: T_Payload): Promise<ApiResult<T_Response>> => {
  return authFetch<T_Response>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

const authPut = <T_Response, T_Payload = unknown>(url: string, payload: T_Payload): Promise<ApiResult<T_Response>> => {
  return authFetch<T_Response>(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};


export const ProfileService = {
  createProfile: async (payload: CreateProfileDto): Promise<ApiResult<ProfileDto>> => {
    return authPost<ProfileDto, CreateProfileDto>(`${
    BASE_API_URL}/api/profiles`, payload);
  },

  getProfile: async (profileId: number): Promise<ApiResult<ProfileDto>> => {
    return authGet<ProfileDto>(`${
    BASE_API_URL}/api/profiles/${profileId}`);
  },

  getProfileByUserId: async (userId: string): Promise<ApiResult<ProfileDto>> => {
    return authGet<ProfileDto>(`${
    BASE_API_URL}/api/profiles/user/${userId}`);
  },

  updateProfile: async (profileId: number, payload: UpdateProfileDto): Promise<ApiResult<{ message: string }>> => {
    return authPut<{ message: string }, UpdateProfileDto>(`${
    BASE_API_URL}/api/profiles/${profileId}`, payload);
  },
};
