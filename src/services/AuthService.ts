import { signOut } from 'firebase/auth';
import type { AuthError } from 'firebase/auth';
import { auth, signInWithGooglePopup } from '../lib/firebase';
import type { ServiceResult } from '@/types/api.types';
import type { AuthResponse, GoogleLoginPayload, LoginPayload, RegisterPayload } from '@/types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const loginWithGooglePopup = async (): Promise<ServiceResult<AuthResponse>> => {
  try {
    const result = await signInWithGooglePopup(); // Changed: This now returns UserCredential | null
    if (!result || !result.user) {
      return { success: false, error: 'Google Sign-In failed or user data not found.' };
    }

    const idToken = await result.user.getIdToken();
    if (!idToken) {
      return { success: false, error: 'No Google ID Token found after popup.' };
    }

    // Extract user details from Google Sign-In result
    const userDetails: Omit<GoogleLoginPayload, 'idToken'> = {
      fullName: result.user.displayName || "Unknown User",
      dateOfBirth: "2000-01-01", 
      phoneNumber: "0000000000", 
      gender: "Male", 
      hometown: "Not specified", 
    };

    const payload: GoogleLoginPayload = {
      idToken,
      ...userDetails,
    };

    const response = await fetch(`${API_BASE_URL}/auth/login/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error || `Backend request failed: ${response.statusText}`;
      console.error('Error during backend Google login after popup:', errorMessage);
      return { success: false, error: errorMessage };
    }
    
    return { success: true, data: responseData as AuthResponse };
  } catch (error) {
    console.error('Error processing Google login popup:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

const logout = async (): Promise<{ success: boolean; error?: AuthError | Error | string }> => {
  try {
    // Call the backend logout API
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `Backend logout failed: ${response.statusText}`;
        console.error('Error during backend logout:', errorMessage);
        return { success: false, error: errorMessage };
      }
      console.log('Backend logout successful');
    }

    // Proceed with Firebase sign out and clearing local storage
    await signOut(auth);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

const registerWithEmail = async (payload: RegisterPayload): Promise<ServiceResult<AuthResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();
    if (!response.ok) {
      const errorMessage = responseData.error || `Backend registration failed: ${response.statusText}`;
      console.error('Error during backend email registration:', errorMessage);
      return { success: false, error: errorMessage };
    }
    console.log('Backend email registration successful:', responseData);
    return { success: true, data: responseData as AuthResponse };
  } catch (error) {
    console.error('Error processing email registration:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

const loginWithEmail = async (payload: LoginPayload): Promise<ServiceResult<AuthResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();
    if (!response.ok) {
      const errorMessage = responseData.error || `Backend login failed: ${response.statusText}`;
      console.error('Error during backend email login:', errorMessage);
      return { success: false, error: errorMessage };
    }
    console.log('Backend email login successful:', responseData);
    return { success: true, data: responseData as AuthResponse };
  } catch (error) {
    console.error('Error processing email login:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

const refreshToken = async (): Promise<ServiceResult<AuthResponse>> => {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  if (!currentRefreshToken) {
    return { success: false, error: 'No refresh token available.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error || `Token refresh failed: ${response.statusText}`;
      console.error('Error during token refresh:', errorMessage);
      await logout();
      window.dispatchEvent(new CustomEvent('sessionExpired'));
      return { success: false, error: responseData.error || 'Token refresh failed and session terminated' };
    }

    // Store new tokens
    localStorage.setItem('accessToken', responseData.accessToken);
    if (responseData.refreshToken) {
      localStorage.setItem('refreshToken', responseData.refreshToken);
    }
    console.log('Token refresh successful');
    return { success: true, data: responseData as AuthResponse };
  } catch (error) {
    console.error('Exception during token refresh:', error);
    await logout(); 
    window.dispatchEvent(new CustomEvent('sessionExpired'));
    return { success: false, error: `Exception during token refresh and session terminated: ${error instanceof Error ? error.message : String(error)}` };
  }
};

let isRefreshingToken = false;
let refreshTokenPromiseHolder: Promise<ServiceResult<AuthResponse>> | null = null;

async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const originalFetch = async (attempt: number): Promise<Response> => {
    const token = localStorage.getItem('accessToken');
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const currentInit = { ...init, headers };
    let response = await fetch(input, currentInit);

    if (response.status === 401 && attempt === 1) {
      if (!isRefreshingToken) {
        isRefreshingToken = true;
        refreshTokenPromiseHolder = refreshToken().finally(() => {
          isRefreshingToken = false;
          refreshTokenPromiseHolder = null;
        });
      }

      if (refreshTokenPromiseHolder) {
        const refreshResult = await refreshTokenPromiseHolder;
        if (refreshResult.success && localStorage.getItem('accessToken')) {
          // Token refreshed, retry original request
          return originalFetch(2); // Indicate second attempt
        } else {
          // Refresh failed or no new token, return original 401 response
          // Refresh failed, throw an error to notify the caller
          throw new Error('Session expired or token refresh failed.');
        }
      }
    }
    return response;
  };
  return originalFetch(1); // Indicate first attempt
}

const apiClientInstance = {
  async get(url: string, config?: { params?: any }) {
    let fullUrl = `${API_BASE_URL}${url}`;
    if (config?.params) {
      const queryParams = new URLSearchParams(config.params).toString();
      if (queryParams) {
        fullUrl += `?${queryParams}`;
      }
    }
    const response = await fetchWithAuth(fullUrl, { method: 'GET' });

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      responseData = responseText; // If not JSON, use raw text
    }

    if (!response.ok) {
      const error: any = new Error(
        (typeof responseData === 'object' && responseData?.error) ||
        (typeof responseData === 'object' && responseData?.message) ||
        (typeof responseData === 'string' && responseData) ||
        `Request failed with status ${response.status}`
      );
      error.response = {
        data: responseData,
        status: response.status,
        headers: response.headers
      };
      console.error(`API Client GET Error ${response.status} for URL ${fullUrl}:`, responseData);
      throw error;
    }
    return { data: responseData, status: response.status, headers: response.headers };
  },

  async post(url: string, body?: any, config?: { params?: any }) {
    let fullUrl = `${API_BASE_URL}${url}`;
    if (config?.params) {
      const queryParams = new URLSearchParams(config.params).toString();
      if (queryParams) {
        fullUrl += `?${queryParams}`;
      }
    }
    const response = await fetchWithAuth(fullUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      responseData = responseText;
    }

    if (!response.ok) {
      const error: any = new Error(
        (typeof responseData === 'object' && responseData?.error) ||
        (typeof responseData === 'object' && responseData?.message) ||
        (typeof responseData === 'string' && responseData) ||
        `Request failed with status ${response.status}`
      );
      error.response = {
        data: responseData,
        status: response.status,
        headers: response.headers
      };
      console.error(`API Client POST Error ${response.status} for URL ${fullUrl}:`, responseData);
      throw error;
    }
    return { data: responseData, status: response.status, headers: response.headers };
  },

  async put(url: string, body?: any, config?: { params?: any }) {
    let fullUrl = `${API_BASE_URL}${url}`;
    if (config?.params) {
      const queryParams = new URLSearchParams(config.params).toString();
      if (queryParams) {
        fullUrl += `?${queryParams}`;
      }
    }
    const response = await fetchWithAuth(fullUrl, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      responseData = responseText;
    }

    if (!response.ok) {
      const error: any = new Error(
        (typeof responseData === 'object' && responseData?.error) ||
        (typeof responseData === 'object' && responseData?.message) ||
        (typeof responseData === 'string' && responseData) ||
        `Request failed with status ${response.status}`
      );
      error.response = {
        data: responseData,
        status: response.status,
        headers: response.headers
      };
      console.error(`API Client PUT Error ${response.status} for URL ${fullUrl}:`, responseData);
      throw error;
    }
    return { data: responseData, status: response.status, headers: response.headers };
  },

  async delete(url: string, config?: { params?: any }) {
    let fullUrl = `${API_BASE_URL}${url}`;
    if (config?.params) {
      const queryParams = new URLSearchParams(config.params).toString();
      if (queryParams) {
        fullUrl += `?${queryParams}`;
      }
    }
    const response = await fetchWithAuth(fullUrl, { method: 'DELETE' });

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      responseData = responseText;
    }

    if (!response.ok) {
      const error: any = new Error(
        (typeof responseData === 'object' && responseData?.error) ||
        (typeof responseData === 'object' && responseData?.message) ||
        (typeof responseData === 'string' && responseData) ||
        `Request failed with status ${response.status}`
      );
      error.response = {
        data: responseData,
        status: response.status,
        headers: response.headers
      };
      console.error(`API Client DELETE Error ${response.status} for URL ${fullUrl}:`, responseData);
      throw error;
    }
    return { data: responseData, status: response.status, headers: response.headers };
  },

  async patch(url: string, body?: any, config?: { params?: any }) {
    let fullUrl = `${API_BASE_URL}${url}`;
    if (config?.params) {
      const queryParams = new URLSearchParams(config.params).toString();
      if (queryParams) {
        fullUrl += `?${queryParams}`;
      }
    }
    const response = await fetchWithAuth(fullUrl, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      responseData = responseText;
    }

    if (!response.ok) {
      const error: any = new Error(
        (typeof responseData === 'object' && responseData?.error) ||
        (typeof responseData === 'object' && responseData?.message) ||
        (typeof responseData === 'string' && responseData) ||
        `Request failed with status ${response.status}`
      );
      error.response = {
        data: responseData,
        status: response.status,
        headers: response.headers
      };
      console.error(`API Client PATCH Error ${response.status} for URL ${fullUrl}:`, responseData);
      throw error;
    }
    return { data: responseData, status: response.status, headers: response.headers };
  }
};

// Public API client for endpoints that don't require authentication
const publicApiClientInstance = {
  async get(url: string, config?: { params?: any }) {
    let fullUrl = `${API_BASE_URL}${url}`;
    if (config?.params) {
      const queryParams = new URLSearchParams(config.params).toString();
      if (queryParams) {
        fullUrl += `?${queryParams}`;
      }
    }
    const response = await fetch(fullUrl, { method: 'GET' });

    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      responseData = responseText; // If not JSON, use raw text
    }

    if (!response.ok) {
      const error: any = new Error(
        (typeof responseData === 'object' && responseData?.error) ||
        (typeof responseData === 'object' && responseData?.message) ||
        (typeof responseData === 'string' && responseData) ||
        `Request failed with status ${response.status}`
      );
      error.response = {
        data: responseData,
        status: response.status,
        headers: response.headers
      };
      console.error(`Public API Client GET Error ${response.status} for URL ${fullUrl}:`, responseData);
      throw error;
    }
    return { data: responseData, status: response.status, headers: response.headers };
  },

  async post(url: string, body?: any, config?: { params?: any }) {
    let fullUrl = `${API_BASE_URL}${url}`;
    if (config?.params) {
      const queryParams = new URLSearchParams(config.params).toString();
      if (queryParams) {
        fullUrl += `?${queryParams}`;
      }
    }
    const response = await fetch(fullUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const responseText = await response.text();
    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      responseData = responseText;
    }

    if (!response.ok) {
      const error: any = new Error(
        (typeof responseData === 'object' && responseData?.error) ||
        (typeof responseData === 'object' && responseData?.message) ||
        (typeof responseData === 'string' && responseData) ||
        `Request failed with status ${response.status}`
      );
      error.response = {
        data: responseData,
        status: response.status,
        headers: response.headers
      };
      console.error(`Public API Client POST Error ${response.status} for URL ${fullUrl}:`, responseData);
      throw error;
    }
    return { data: responseData, status: response.status, headers: response.headers };
  },
};

export const apiClient = apiClientInstance;
export const publicApiClient = publicApiClientInstance;

export const AuthService = {
  loginWithGooglePopup,
  logout,
  registerWithEmail,
  loginWithEmail,
  refreshToken,
  fetchWithAuth,
};