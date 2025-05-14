import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthService, type AuthResponse, type GoogleLoginPayload, type RegisterPayload, type LoginPayload } from '../services/AuthService';

export interface AppUser {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
}

interface AuthContextType {
  currentUser: AppUser | null;
  accessToken: string | null;
  loading: boolean;
  handleGoogleLogin: (userDetails: Omit<GoogleLoginPayload, 'idToken'>) => Promise<boolean>;
  handleEmailRegister: (payload: RegisterPayload) => Promise<boolean>;
  handleEmailLogin: (payload: LoginPayload) => Promise<boolean>;
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
      fullName: backendResponse.fullName,
      avatarUrl: backendResponse.avatarUrl,
      role: backendResponse.role,
    };
    setCurrentUser(appUser);
    setAccessToken(backendResponse.accessToken);
    localStorage.setItem('accessToken', backendResponse.accessToken);
    localStorage.setItem('refreshToken', backendResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(appUser));
    AuthService.startPeriodicTokenRefresh(); // Start periodic refresh
  };

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const user: AppUser = JSON.parse(storedUser);
        setAccessToken(storedToken);
        setCurrentUser(user);
        AuthService.startPeriodicTokenRefresh(); // Also start if user is already logged in
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
    try {
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

  const handleEmailRegister = async (payload: RegisterPayload): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await AuthService.registerWithEmail(payload);
      if (result.success && result.data) {
        processLoginData(result.data);
        setLoading(false);
        return true;
      } else {
        console.error("Failed to register with email:", result.error);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Exception during email registration:", error);
      setLoading(false);
      return false;
    }
  };

  const handleEmailLogin = async (payload: LoginPayload): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await AuthService.loginWithEmail(payload);
      if (result.success && result.data) {
        processLoginData(result.data);
        setLoading(false);
        return true;
      } else {
        console.error("Failed to login with email:", result.error);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Exception during email login:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    const result = await AuthService.logout();
    if (!result.success) {
      console.error("Backend logout failed:", result.error);
    }
    // Always clear client-side session
    setCurrentUser(null);
    setAccessToken(null);
    AuthService.stopPeriodicTokenRefresh(); // Stop periodic refresh
    setLoading(false);
  };

  const value = {
    currentUser,
    accessToken,
    loading,
    handleGoogleLogin,
    handleEmailRegister,
    handleEmailLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
