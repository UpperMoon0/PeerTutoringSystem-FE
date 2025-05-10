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
  const [loading, setLoading] = useState(true); // Keep loading state for initial check and during login

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

  // Simplified initialization: just check for existing stored session
  const initializeAuth = useCallback(async () => {
    setLoading(true);
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
    initializeAuth(); // Use the simplified initializer
  }, [initializeAuth]);

  const handleGoogleLogin = async (userDetails: Omit<GoogleLoginPayload, 'idToken'>): Promise<boolean> => {
    setLoading(true);
    try {
      // Use the new popup login service method
      const result = await AuthService.loginWithGooglePopup(userDetails);
      if (result.success && result.data) {
        processLoginData(result.data);
        setLoading(false);
        return true;
      } else {
        console.error("Failed to login with Google Popup:", result.error);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Exception during Google Popup Login:", error);
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
