import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithRedirect, getRedirectResult, signInWithPopup, type UserCredential } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const signInWithGoogleRedirect = async (): Promise<void> => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error("Google Sign-In Redirect Error:", error);
    throw error;
  }
};

const handleGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result; // Return the entire UserCredential
  } catch (error: any) {
    console.error("Google Redirect Result Error:", error);
    return null;
  }
};

const signInWithGooglePopup = async (): Promise<UserCredential | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result; // Return the entire UserCredential
  } catch (error: any) {
    console.error("Google Sign-In Popup Error:", error);
    throw error; // Rethrow to be caught by the caller in AuthService
  }
};

export { auth, googleProvider, facebookProvider, signInWithGoogleRedirect, handleGoogleRedirectResult, signInWithGooglePopup };
