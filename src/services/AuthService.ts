import { signOut } from 'firebase/auth';
import type { AuthError } from 'firebase/auth';
import { auth, signInWithGooglePopup } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Matches the backend's AuthResponseDto
export interface AuthResponse {
  userID: string;
  anonymousName: string;
  accessToken: string;
  refreshToken: string;
  avatarUrl?: string;
  role: string;
}

// Matches the backend's GoogleLoginDto
export interface GoogleLoginPayload {
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


const loginWithGoogle = async (userDetails: Omit<GoogleLoginPayload, 'idToken'>): Promise<ServiceResult<AuthResponse>> => {
  try {
    const idToken = await signInWithGooglePopup();
    if (!idToken) {
      return { success: false, error: 'Failed to get Google ID Token.' };
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
      // Assuming the backend returns an error object like { error: "message" }
      const errorMessage = responseData.error || `Backend request failed: ${response.statusText}`;
      console.error('Error during backend Google login:', errorMessage);
      return { success: false, error: errorMessage };
    }
    
    console.log('Backend Google login successful:', responseData);
    return { success: true, data: responseData as AuthResponse };
  } catch (error) {
    console.error('Error during Google login process:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};


const logout = async (): Promise<{ success: boolean; error?: AuthError | Error }> => {
  try {
    // TODO: Implement backend logout if necessary by calling the /api/auth/logout endpoint
    // For now, just signing out from Firebase locally
    await signOut(auth); 
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Or whatever key you use for user info
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error: error as AuthError };
  }
};

export const AuthService = {
  loginWithGoogle,
  logout,
};
