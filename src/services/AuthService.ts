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

let refreshTokenIntervalId: NodeJS.Timeout | null = null;

// Function to be called by AuthContext for periodic refresh or initial load
const refreshTokenClient = async (): Promise<ServiceResult<AuthResponse>> => {
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
      // If refresh fails (e.g. refresh token is invalid/expired), trigger a global event or handle logout in AuthContext
      // For now, just return error. AuthContext will handle logout.
      return { success: false, error: errorMessage };
    }

    // Store new tokens
    localStorage.setItem('accessToken', responseData.accessToken);
    if (responseData.refreshToken) { // Backend might issue a new refresh token
      localStorage.setItem('refreshToken', responseData.refreshToken);
    }
    console.log('Token refresh successful');
    return { success: true, data: responseData as AuthResponse };
  } catch (error) {
    console.error('Exception during token refresh:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

// This is the internal refresh logic used by _fetchWithAuthCore
// It's slightly different as it's part of a retry mechanism
const refreshTokenInternal = async (): Promise<ServiceResult<AuthResponse>> => {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  if (!currentRefreshToken) {
    // No refresh token, so cannot refresh. _fetchWithAuthCore will return the 401.
    return { success: false, error: 'No refresh token available for internal refresh.' };
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
      console.error('Internal token refresh failed:', responseData.error || response.statusText);
      // Critical: If internal refresh fails, clear tokens and effectively log out the user
      // This prevents infinite loops if the refresh token is truly dead.
      // AuthContext will show the modal via its periodic check or next user action.
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Dispatch a custom event that AuthContext can listen to, to trigger session expired modal immediately
      window.dispatchEvent(new CustomEvent('sessionExpired'));
      return { success: false, error: responseData.error || 'Internal refresh failed and session cleared' };
    }
    localStorage.setItem('accessToken', responseData.accessToken);
    if (responseData.refreshToken) {
      localStorage.setItem('refreshToken', responseData.refreshToken);
    }
    return { success: true, data: responseData as AuthResponse };
  } catch (error) {
    console.error('Exception during internal token refresh:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('sessionExpired'));
    return { success: false, error: 'Exception in internal refresh and session cleared' };
  }
};

let isRefreshingToken = false;
let refreshTokenPromiseHolder: Promise<ServiceResult<AuthResponse>> | null = null;

// Renamed from _fetchWithAuthCore
async function fetchWithAuthHandler(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
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
        // Use the internal refresh function for the interceptor
        refreshTokenPromiseHolder = refreshTokenInternal().finally(() => {
          isRefreshingToken = false;
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
          console.log('Token refreshed by interceptor, retrying original request.');
          // The new token is in localStorage, originalFetch will pick it up.
          return originalFetch(2); // Second attempt
        } else {
          console.error('Interceptor: Failed to refresh token. Original 401 will be returned or session already cleared.');
          // If refreshTokenInternal cleared the session, this original 401 might be less relevant
          // or the user is already being redirected/shown a modal by AuthContext via the event.
          return response; // Return original 401 response
        }
      } catch (error) {
        console.error('Interceptor: Error during token refresh process:', error);
        return response; // Return original 401 response
      }
    }
    return response;
  };

  return originalFetch(1);
}

// Export the client-side refresh function and other necessary functions
export const AuthService = {
  loginWithGooglePopup,
  logout,
  registerWithEmail,
  loginWithEmail,
  refreshTokenClient, // Export this for AuthContext
  fetchWithAuth: fetchWithAuthHandler, // Updated to use the new name
};