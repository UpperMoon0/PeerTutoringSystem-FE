import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthService, type AuthResponse, type GoogleLoginPayload } from '../services/AuthService';

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
    try {
      const redirectResult = await AuthService.processGoogleLoginRedirect();
      if (redirectResult.success && redirectResult.data) {
        processLoginData(redirectResult.data);
        setLoading(false);
        return;
      } else if (redirectResult.error && redirectResult.error !== 'No Google ID Token found after redirect.') {
        console.error("Error processing Google login redirect:", redirectResult.error);
      }
    } catch (error) {
      console.error("Exception processing Google login redirect:", error);
    }

    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const user: AppUser = JSON.parse(storedUser);
        // TODO: Add token validation/refresh logic here if needed
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
  }, []);

  useEffect(() => {
    initializeAuthAndProcessRedirect();
  }, [initializeAuthAndProcessRedirect]);

  const handleGoogleLogin = async (userDetails: Omit<GoogleLoginPayload, 'idToken'>): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await AuthService.initiateGoogleLoginRedirect(userDetails);
      if (result.success) {
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
    await AuthService.logout();
    setCurrentUser(null);
    setAccessToken(null);
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
