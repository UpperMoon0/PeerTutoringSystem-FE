import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthService} from '../services/AuthService';
import SessionExpiredModal from '@/components/common/SessionExpiredModal'; // Import the modal
import type { GoogleLoginPayload } from '@/types/GoogleLoginPayload';
import type { RegisterPayload } from '@/types/RegisterPayload';
import type { LoginPayload } from '@/types/LoginPayload';
import type { AuthResponse } from '@/types/AuthResponse';

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
  isSessionExpired: boolean; // Add state for session expiration
  handleGoogleLogin: (userDetails: Omit<GoogleLoginPayload, 'idToken'>) => Promise<boolean>;
  handleEmailRegister: (payload: RegisterPayload) => Promise<boolean>;
  handleEmailLogin: (payload: LoginPayload) => Promise<boolean>;
  logout: (sessionExpired?: boolean) => Promise<void>; // Add optional parameter
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
  const [isSessionExpired, setIsSessionExpired] = useState(false); // State for modal visibility
  const [refreshTokenIntervalId, setRefreshTokenIntervalId] = useState<NodeJS.Timeout | null>(null);

  const handleLogoutDueToExpiry = useCallback(() => {
    setCurrentUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (refreshTokenIntervalId) {
      clearInterval(refreshTokenIntervalId);
      setRefreshTokenIntervalId(null);
    }
    setIsSessionExpired(true); // Show session expired modal
     // Stop periodic refresh is handled by AuthService now
  }, [refreshTokenIntervalId]);

  const processLoginData = useCallback((backendResponse: AuthResponse) => {
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
    setIsSessionExpired(false); // Reset session expired state on new login

    // Clear any existing interval before starting a new one
    if (refreshTokenIntervalId) {
      clearInterval(refreshTokenIntervalId);
    }

    // Start periodic refresh
    const intervalId = setInterval(async () => {
      console.log('Attempting periodic token refresh...');
      const result = await AuthService.refreshToken();
      if (!result.success) {
        console.error('Periodic refresh failed:', result.error);
        handleLogoutDueToExpiry(); // Logout if refresh fails
      } else {
        console.log('Periodic refresh successful');
        // Update access token in state and local storage
        if (result.data?.accessToken) {
            setAccessToken(result.data.accessToken);
            localStorage.setItem('accessToken', result.data.accessToken);
        }
        if (result.data?.refreshToken) {
            localStorage.setItem('refreshToken', result.data.refreshToken);
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
    setRefreshTokenIntervalId(intervalId);
  }, [refreshTokenIntervalId, handleLogoutDueToExpiry]);


  const initializeAuth = useCallback(async () => {
    setLoading(true);
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedToken && storedUser && storedRefreshToken) {
      try {
        // Attempt to refresh token immediately to validate session
        console.log('Initializing auth, attempting to refresh token...');
        const refreshResult = await AuthService.refreshToken();
        if (refreshResult.success && refreshResult.data) {
          const user: AppUser = JSON.parse(storedUser);
          setAccessToken(refreshResult.data.accessToken);
          setCurrentUser(user);
          localStorage.setItem('accessToken', refreshResult.data.accessToken);
          if (refreshResult.data.refreshToken) {
            localStorage.setItem('refreshToken', refreshResult.data.refreshToken);
          }
          // Start periodic refresh after successful initial refresh
          processLoginData(refreshResult.data);
        } else {
          console.log('Initial token refresh failed, logging out.');
          handleLogoutDueToExpiry();
        }
      } catch (error) {
        console.error("Error during initial auth and token refresh:", error);
        handleLogoutDueToExpiry();
      }
    }
    setLoading(false);
  }, [processLoginData, handleLogoutDueToExpiry]);

  useEffect(() => {
    initializeAuth();
    // Cleanup interval on component unmount
    return () => {
      if (refreshTokenIntervalId) {
        clearInterval(refreshTokenIntervalId);
      }
    };
  }, [initializeAuth, refreshTokenIntervalId]);

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

  const logout = async (sessionExpired = false) => {
    setLoading(true);
    if (!sessionExpired) { // Only call backend logout if not due to session expiry
      const result = await AuthService.logout();
      if (!result.success) {
        console.error("Backend logout failed:", result.error);
      }
    }
    // Always clear client-side session
    setCurrentUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (refreshTokenIntervalId) {
      clearInterval(refreshTokenIntervalId);
      setRefreshTokenIntervalId(null);
    }
    if (sessionExpired) {
      setIsSessionExpired(true);
    }
    setLoading(false);
  };

  const closeModalAndRedirect = () => {
    setIsSessionExpired(false);
    // Redirect to login page, or handle as appropriate
    // This might require access to router history, or a callback prop
    window.location.href = '/login'; 
  };

  const value = {
    currentUser,
    accessToken,
    loading,
    isSessionExpired,
    handleGoogleLogin,
    handleEmailRegister,
    handleEmailLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredModal isOpen={isSessionExpired} onClose={closeModalAndRedirect} />
    </AuthContext.Provider>
  );
};
