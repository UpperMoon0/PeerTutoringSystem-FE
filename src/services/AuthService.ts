import { signOut } from 'firebase/auth';
import type { AuthError } from 'firebase/auth';
import { auth, signInWithGooglePopup } from '../lib/firebase'; // Removed handleGoogleRedirectResult, signInWithGoogleRedirect

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const TEMP_USER_DETAILS_KEY = 'tempGoogleUserDetails'; // No longer needed for popup flow

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

// Renamed and refactored for popup flow
const loginWithGooglePopup = async (userDetails: Omit<GoogleLoginPayload, 'idToken'>): Promise<ServiceResult<AuthResponse>> => {
  try {
    const idToken = await signInWithGooglePopup();
    if (!idToken) {
      return { success: false, error: 'No Google ID Token found after popup.' };
    }

    // User details are passed directly, no need for sessionStorage
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
  loginWithGooglePopup, // Updated function name
  logout,
};

export type { AuthResponse, GoogleLoginPayload };
