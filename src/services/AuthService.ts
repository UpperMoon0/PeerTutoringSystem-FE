import { signOut } from 'firebase/auth';
import type { AuthError } from 'firebase/auth';
import { auth, signInWithGoogleRedirect, handleGoogleRedirectResult } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TEMP_USER_DETAILS_KEY = 'tempGoogleUserDetails';

interface AuthResponse {
  userID: string;
  anonymousName: string;
  accessToken: string;
  refreshToken: string;
  avatarUrl?: string;
  role: string;
}

interface GoogleLoginPayload {
  idToken: string;
  anonymousName: string;
  dateOfBirth: string; // Assuming YYYY-MM-DD string format
  phoneNumber: string;
  gender: string; // "Male", "Female", "Other"
  hometown: string;
}

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string | Error; // Can be a string for simple messages or an Error object
}

const initiateGoogleLoginRedirect = async (userDetails: Omit<GoogleLoginPayload, 'idToken'>): Promise<{ success: boolean; error?: string | Error }> => {
  try {
    sessionStorage.setItem(TEMP_USER_DETAILS_KEY, JSON.stringify(userDetails));
    await signInWithGoogleRedirect();
    return { success: true };
  } catch (error) {
    console.error('Error initiating Google login redirect:', error);
    sessionStorage.removeItem(TEMP_USER_DETAILS_KEY);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

const processGoogleLoginRedirect = async (): Promise<ServiceResult<AuthResponse>> => {
  try {
    const idToken = await handleGoogleRedirectResult();
    if (!idToken) {
      return { success: false, error: 'No Google ID Token found after redirect.' };
    }

    const storedUserDetails = sessionStorage.getItem(TEMP_USER_DETAILS_KEY);
    if (!storedUserDetails) {
      console.error('Temporary user details not found after redirect.');
      return { success: false, error: 'User details not found after redirect. Please try logging in again.' };
    }
    sessionStorage.removeItem(TEMP_USER_DETAILS_KEY);

    const userDetails: Omit<GoogleLoginPayload, 'idToken'> = JSON.parse(storedUserDetails);

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
      console.error('Error during backend Google login after redirect:', errorMessage);
      return { success: false, error: errorMessage };
    }
    
    console.log('Backend Google login successful after redirect:', responseData);
    return { success: true, data: responseData as AuthResponse };
  } catch (error) {
    console.error('Error processing Google login redirect:', error);
    sessionStorage.removeItem(TEMP_USER_DETAILS_KEY);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

const logout = async (): Promise<{ success: boolean; error?: AuthError | Error }> => {
  try {
    // TODO: Implement backend logout if necessary by calling the /api/auth/logout endpoint
    await signOut(auth);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error: error as AuthError };
  }
};

export const AuthService = {
  initiateGoogleLoginRedirect,
  processGoogleLoginRedirect,
  logout,
};

export type { AuthResponse, GoogleLoginPayload };
