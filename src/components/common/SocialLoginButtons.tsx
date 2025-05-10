import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext'; // Updated import
import { useNavigate } from 'react-router-dom';
// Removed AuthService import as we'll use the context's handler

interface SocialLoginButtonsProps {
  // loading and setLoading might be handled by AuthContext now,
  // but keeping them for now if the parent component still manages some loading state.
  // Consider removing if AuthContext.loading is sufficient.
  loading: boolean; 
  setLoading: (loading: boolean) => void; // Or rely on AuthContext.loading
  setError: (error: string | null) => void;
  pageType?: 'login' | 'register'; 
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  loading: parentLoading, // Renamed to avoid conflict with context's loading
  setLoading: setParentLoading, // Renamed
  setError,
  pageType = 'login',
}) => {
  const navigate = useNavigate();
  const auth = useAuth(); // Use the AuthContext

  const handleGoogleAuthClick = async () => {
    setError(null);
    // setParentLoading(true); // Parent can still manage its own loading if needed

    // Placeholder user details for GoogleLoginPayload
    // IMPORTANT: These should be collected from the user if they are new.
    // For existing users, the backend might ignore these if it finds the user by Firebase UID.
    const placeholderUserDetails = {
      anonymousName: "GoogleUser" + Date.now().toString().slice(-5), // Simple unique anonymous name
      dateOfBirth: "2000-01-01", // Placeholder DOB
      phoneNumber: "0000000000",   // Placeholder phone
      gender: "Other",             // Placeholder gender
      hometown: "Unknown",         // Placeholder hometown
    };

    try {
      const success = await auth.handleGoogleLogin(placeholderUserDetails);
      if (success) {
        console.log(`Google ${pageType} successful, navigating...`);
        navigate('/'); // Navigate on successful login from backend
      } else {
        // Error should be handled within handleGoogleLogin or it can return an error message
        setError(`Google ${pageType} failed. Please try again.`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during Google login.');
    } finally {
      // setParentLoading(false); // Parent can still manage its own loading
      // AuthContext's loading state will be updated by handleGoogleLogin
    }
  };

  return (
    <div className="space-y-2 mb-6">
      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={handleGoogleAuthClick}
        disabled={parentLoading || auth.loading} // Disable if parent or auth context is loading
      >
        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      {/* Facebook button removed as it's not implemented in the backend */}
    </div>
  );
};

export default SocialLoginButtons;
