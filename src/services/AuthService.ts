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

export const AuthService = {
  loginWithGooglePopup,
  registerWithEmail,
  loginWithEmail,
  logout,
};

export type { AuthResponse, GoogleLoginPayload, RegisterPayload, LoginPayload, ServiceResult };
