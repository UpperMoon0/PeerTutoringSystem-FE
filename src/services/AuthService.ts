import { signInWithPopup, signOut } from 'firebase/auth';
import type { UserCredential, AuthError } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../lib/firebase';

// Define a more specific type for the login result if needed
interface LoginResult {
  success: boolean;
  user?: UserCredential['user']; 
  idToken?: string;
  error?: AuthError | Error;
}

const loginWithGoogle = async (): Promise<LoginResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    console.log('Google login successful, ID Token:', idToken);
    return { success: true, user, idToken };
  } catch (error) {
    console.error('Error during Google login:', error);
    return { success: false, error: error as AuthError };
  }
};

const loginWithFacebook = async (): Promise<LoginResult> => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    // Send idToken to backend
    console.log('Facebook login successful, ID Token:', idToken);
    return { success: true, user, idToken };
  } catch (error) {
    console.error('Error during Facebook login:', error);
    return { success: false, error: error as AuthError };
  }
};

const logout = async (): Promise<{ success: boolean; error?: AuthError }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error: error as AuthError };
  }
};


const verifyTokenWithBackend = async (idToken: string): Promise<any> => {
  try {
    // Replace with your actual backend endpoint
    const response = await fetch('/api/auth/verify-firebase-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Backend verification failed: ${response.statusText}`);
    }
    return await response.json(); // Or handle response as needed
  } catch (error) {
    console.error('Error verifying token with backend:', error);
    throw error; // Re-throw to be caught by the caller
  }
};

export const AuthService = {
  loginWithGoogle,
  loginWithFacebook,
  logout,
  verifyTokenWithBackend, 
};
