import { signOut } from 'firebase/auth';
import type { AuthError } from 'firebase/auth';
import { auth, signInWithGooglePopup } from '../lib/firebase';
import type { AuthResponse } from '../types/AuthResponse';
import type { GoogleLoginPayload } from '../types/GoogleLoginPayload';
import type { RegisterPayload } from '../types/RegisterPayload';
import type { LoginPayload } from '../types/LoginPayload';
import type { ServiceResult } from '../types/ServiceResult';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const loginWithGooglePopup = async (userDetails: Omit<GoogleLoginPayload, 'idToken'>): Promise<ServiceResult<AuthResponse>> => {
  try {
    const idToken = await signInWithGooglePopup();
    if (!idToken) {
      return { success: false, error: 'No Google ID Token found after popup.' };
    }

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
    
    console.log('Backend Google login successful after popup:', responseData);
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

let isRefreshingToken = false;
let refreshTokenPromiseHolder: Promise<ServiceResult<AuthResponse>> | null = null;

async function _fetchWithAuthCore(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const originalFetch = async (attempt: number): Promise<Response> => {
    const token = localStorage.getItem('accessToken');
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const currentInit = { ...init, headers };
    let response = await fetch(input, currentInit);

    // Only try to refresh on the first attempt
    if (response.status === 401 && attempt === 1) { 
      if (!isRefreshingToken) {
        isRefreshingToken = true;
        refreshTokenPromiseHolder = refreshToken().finally(() => {
          isRefreshingToken = false;
          // Set to null so the next refresh cycle gets a new promise
          refreshTokenPromiseHolder = null; 
        });
      }

      try {
        if (!refreshTokenPromiseHolder) {
          console.error('refreshTokenPromiseHolder is null, cannot await refresh.');
          return response;
        }
        
        const refreshResult = await refreshTokenPromiseHolder; 
        
        if (refreshResult && refreshResult.success) {
          console.log('Token refreshed, retrying original request.');
          // The new token is in localStorage, originalFetch will pick it up.
          return originalFetch(2); // Second attempt
        } else {
          console.error('Failed to refresh token. User might be logged out by refreshToken function.');
          return response; 
        }
      } catch (error) { 
        console.error('Error during token refresh process:', error);
        return response; 
      }
    }
    return response;
  };

  return originalFetch(1);
}

// Helper function to process JSON responses and wrap them in ServiceResult
async function _processJsonResponse<R>(responsePromise: Promise<Response>, requestUrl: string): Promise<ServiceResult<R>> {
  try {
    const response = await responsePromise;
    // Try to parse JSON, but gracefully handle cases where it might not be (e.g. empty body for 204)
    let responseData: any;
    try {
      responseData = await response.json();
    } catch (e) {
      // If parsing fails but response is ok (e.g. 204 No Content), data might be undefined or handle as per API contract
      if (response.ok) {
        return { success: true, data: undefined as R }; // Or handle as appropriate
      }
      // If parsing fails and response is not ok, prioritize the response status error
      const errorMessage = `Request failed: ${response.statusText} (URL: ${requestUrl}), and failed to parse error response body.`;
      console.error(errorMessage, e);
      return { success: false, error: errorMessage };
    }

    if (!response.ok) {
      const errorMessage = responseData?.error || `Request failed: ${response.statusText} (URL: ${requestUrl})`;
      console.error(`Error during authenticated request to ${requestUrl}:`, errorMessage, responseData);
      return { success: false, error: errorMessage };
    }

    return { success: true, data: responseData as R };
  } catch (error) {
    console.error(`Error processing response from ${requestUrl}:`, error);
    const serviceError = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: serviceError };
  }
}

// New generic authenticated request function
const authenticatedRequest = async <R>(
  url: string,
  method: string,
  body?: any,
  init?: RequestInit
): Promise<ServiceResult<R>> => {
  const headers = new Headers(init?.headers); // Initialize Headers object

  const requestOptions: RequestInit = {
    ...init, // Spread user-provided init first
    method: method,
    headers: headers, // Assign the Headers object
  };

  // Set Content-Type for relevant methods if body exists and not already set
  if (body) {
    if (body instanceof FormData) { // FormData is handled differently
      requestOptions.body = body;
    } else if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      requestOptions.body = JSON.stringify(body);
    } else {
      // For GET, HEAD, etc., if a body is provided (unusual but possible), pass it as is.
      // JSON.stringify might not be appropriate here without knowing the content type.
      requestOptions.body = body;
    }
  }
  
  // Use the core fetch logic (which handles auth header and token refresh)
  const responsePromise = _fetchWithAuthCore(url, requestOptions);
  
  // Process the JSON response
  return _processJsonResponse<R>(responsePromise, url);
};

const refreshToken = async (): Promise<ServiceResult<AuthResponse>> => {
  try {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) {
      return { success: false, error: 'No refresh token found in local storage.' };
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error || `Backend request failed: ${response.statusText}`;
      console.error('Error during token refresh:', errorMessage);
      return { success: false, error: errorMessage };
    }

    if (responseData.accessToken && responseData.refreshToken) {
      localStorage.setItem('accessToken', responseData.accessToken);
      localStorage.setItem('refreshToken', responseData.refreshToken);
    } else {
      console.error('New tokens not found in refresh response:', responseData);
      return { success: false, error: 'New tokens not found in refresh response.' };
    }
    
    console.log('Token refresh successful:', responseData);
    return { success: true, data: responseData as AuthResponse };
  } catch (error) {
    console.error('Error processing token refresh:', error);
    logout(); 
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const AuthService = {
  loginWithGooglePopup,
  registerWithEmail,
  loginWithEmail,
  logout,
  refreshToken,
  authenticatedRequest, 
};

export type { AuthResponse, GoogleLoginPayload, RegisterPayload, LoginPayload, ServiceResult };
