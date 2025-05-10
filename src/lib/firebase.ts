import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";

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

const signInWithGooglePopup = async (): Promise<string | null> => {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    // This gives you a Google ID Token. You can use it to identify the user.
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error: any) {
    // Handle Errors here.
    console.error("Google Sign-In Error:", error);
    // const errorCode = error.code;
    // const errorMessage = error.message;
    // The email of the user's account used.
    // const email = error.customData?.email;
    // The AuthCredential type that was used.
    // const credential = GoogleAuthProvider.credentialFromError(error);
    return null;
  }
};

export { auth, googleProvider, facebookProvider, signInWithGooglePopup };
