import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthService, AuthResponse, GoogleLoginPayload } from '../services/AuthService';

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

  const initializeAuth = useCallback(async () => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleGoogleLogin = async (userDetails: Omit<GoogleLoginPayload, 'idToken'>): Promise<boolean> => {
    setLoading(true);
    const result = await AuthService.loginWithGoogle(userDetails);
    if (result.success && result.data) {
      const backendResponse = result.data;
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
      setLoading(false);
      return true;
    }
    setLoading(false);
    console.error("Google Login Failed:", result.error);
    return false;
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
