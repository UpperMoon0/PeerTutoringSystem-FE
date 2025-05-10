import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth"; // Removed UserCredential and signInWithPopup

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// signInWithGooglePopup function removed

const signInWithGoogleRedirect = async (): Promise<void> => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error("Google Sign-In Redirect Error:", error);
    // Potentially throw the error or handle it as needed by the UI
    throw error;
  }
};

const handleGoogleRedirectResult = async (): Promise<string | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // This gives you a Google ID Token.
      const idToken = await result.user.getIdToken();
      return idToken;
    }
    return null; // No redirect result found
  } catch (error: any) {
    console.error("Google Redirect Result Error:", error);
    // const errorCode = error.code;
    // const errorMessage = error.message;
    // const email = error.customData?.email;
    // const credential = GoogleAuthProvider.credentialFromError(error);
    return null;
  }
};

export { auth, googleProvider, facebookProvider, signInWithGoogleRedirect, handleGoogleRedirectResult }; // Removed signInWithGooglePopup
