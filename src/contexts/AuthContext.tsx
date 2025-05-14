import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthService} from '../services/AuthService';
import SessionExpiredModal from '@/components/common/SessionExpiredModal'; // Import the modal
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
  isSessionExpired: boolean; 
  handleGoogleLogin: () => Promise<boolean>; 
  handleEmailRegister: (payload: RegisterPayload) => Promise<boolean>;
  handleEmailLogin: (payload: LoginPayload) => Promise<boolean>;
  logout: (sessionExpired?: boolean) => Promise<void>; 
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
    setRefreshTokenIntervalId(prevIntervalId => {
      if (prevIntervalId) {
        clearInterval(prevIntervalId);
      }
      return null;
    });
    setIsSessionExpired(true); // Show session expired modal
    console.log('Session expired, user logged out, modal triggered.');
  }, []); // Empty dependency array

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

    setRefreshTokenIntervalId(prevIntervalId => {
      if (prevIntervalId) {
        clearInterval(prevIntervalId);
      }
      // Start periodic refresh
      const newIntervalId = setInterval(async () => {
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
      return newIntervalId;
    });
  }, [handleLogoutDueToExpiry]); 

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedRefreshToken) {
      try {
        console.log('Initializing auth, attempting to refresh token...');
        const refreshResult = await AuthService.refreshToken();
        if (refreshResult.success && refreshResult.data) {
          console.log('Initial token refresh successful. Processing login data.');
          processLoginData(refreshResult.data);
        } else {
          console.log('Initial token refresh failed. AuthContext will sync via sessionExpired event.');
        }
      } catch (error) {
        console.error("Exception during initial auth token refresh process:", error);
        handleLogoutDueToExpiry(); // Safeguard: ensure context is cleaned up.
      }
    } else {
      console.log('No stored refresh token found during initialization. User is not logged in.');
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
  }, [initializeAuth]); 

  // Listen for global sessionExpired events dispatched by AuthService
  useEffect(() => {
    const handleGlobalSessionExpired = () => {
      console.log('Global sessionExpired event received by AuthContext.');
      handleLogoutDueToExpiry();
    };

    window.addEventListener('sessionExpired', handleGlobalSessionExpired);

    return () => {
      window.removeEventListener('sessionExpired', handleGlobalSessionExpired);
    };
  }, [handleLogoutDueToExpiry]);

  // Method to handle Google login
  const handleGoogleLogin = async (): Promise<boolean> => { // Removed userDetails parameter
    setLoading(true);
    try {
      // Call the AuthService method that now handles user detail extraction
      const result = await AuthService.loginWithGooglePopup(); 
      if (result.success && result.data) {
        processLoginData(result.data);
        return true;
      } else {
        console.error('Google Login Failed:', result.error);
        // Optionally, set an error state here to be displayed in the UI
        return false;
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      // Optionally, set an error state here
      return false;
    } finally {
      setLoading(false);
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
