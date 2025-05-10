import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthService, type AuthResponse, type GoogleLoginPayload } from '../services/AuthService';

// Simplified user object based on backend response
export interface AppUser {
  userId: string;
  anonymousName: string;
  avatarUrl?: string;
  role: string;
}

interface AuthContextType {
  currentUser: AppUser | null;
  accessToken: string | null;
  loading: boolean;
  handleGoogleLogin: (userDetails: Omit<GoogleLoginPayload, 'idToken'>) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const processLoginData = (backendResponse: AuthResponse) => {
    const appUser: AppUser = {
      userId: backendResponse.userID,
      anonymousName: backendResponse.anonymousName,
      avatarUrl: backendResponse.avatarUrl,
      role: backendResponse.role,
    };
    setCurrentUser(appUser);
    setAccessToken(backendResponse.accessToken);
    localStorage.setItem('accessToken', backendResponse.accessToken);
    localStorage.setItem('refreshToken', backendResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(appUser));
  };

  const initializeAuthAndProcessRedirect = useCallback(async () => {
    setLoading(true);
    // Attempt to process redirect first
    try {
      const redirectResult = await AuthService.processGoogleLoginRedirect();
      if (redirectResult.success && redirectResult.data) {
        processLoginData(redirectResult.data);
        setLoading(false);
        // Potentially navigate away from any login/redirect specific page here
        // For example, if on a '/login-callback' route, redirect to '/'
        // This depends on your routing setup.
        return; // Login successful via redirect
      } else if (redirectResult.error && redirectResult.error !== 'No Google ID Token found after redirect.') {
        // Log significant errors from processGoogleLoginRedirect, but not the "no token" case which is expected on normal loads
        console.error("Error processing Google login redirect:", redirectResult.error);
      }
    } catch (error) {
      console.error("Exception processing Google login redirect:", error);
    }

    // If no redirect, or redirect processing failed non-critically, try to load from storage
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const user: AppUser = JSON.parse(storedUser);
        // TODO: Add token validation/refresh logic here if needed
        // For now, we assume the stored token is valid if it exists
        setAccessToken(storedToken);
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to parse stored user data", error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []); // Removed processLoginData from dependencies as it's stable

  useEffect(() => {
    initializeAuthAndProcessRedirect();
  }, [initializeAuthAndProcessRedirect]);

  const handleGoogleLogin = async (userDetails: Omit<GoogleLoginPayload, 'idToken'>): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await AuthService.initiateGoogleLoginRedirect(userDetails);
      if (result.success) {
        // Redirect initiated. setLoading(false) might not be hit if redirect is immediate.
        // The loading state will be handled by initializeAuthAndProcessRedirect on page load after redirect.
        return true; 
      } else {
        console.error("Failed to initiate Google Login:", result.error);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Exception during Google Login initiation:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    await AuthService.logout(); // This also clears localStorage items
    setCurrentUser(null);
    setAccessToken(null);
    // localStorage items are cleared in AuthService.logout
    setLoading(false);
  };

  const value = {
    currentUser,
    accessToken,
    loading,
    handleGoogleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
