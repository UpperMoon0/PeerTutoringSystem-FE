import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { SocialLoginButtonsProps } from '@/types/SocialLoginButtonsProps';

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  loading: parentLoading,
  setLoading: setParentLoading,
  setError,
  pageType = 'login',
}) => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleGoogleAuthClick = async () => {
    setError(null);
    setParentLoading(true);

    const placeholderUserDetails = {
      fullName: "GoogleUser" + Date.now().toString().slice(-5),
      dateOfBirth: "2000-01-01",
      phoneNumber: "0000000000",
      gender: "Other",
      hometown: "Unknown",
    };

    try {
      const success = await auth.handleGoogleLogin(placeholderUserDetails);
      if (success) {
        console.log(`Google ${pageType} successful, navigating...`);
        navigate('/');
      } else {
        setError(`Google ${pageType} failed. Please try again.`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during Google login.');
    } finally {
      setParentLoading(false);
    }
  };

  return (
    <div className="space-y-2 mb-6">
      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={handleGoogleAuthClick}
        disabled={parentLoading || auth.loading}
      >
        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      {/* Facebook button removed as it's not implemented in the backend */}
    </div>
  );
};

export default SocialLoginButtons;
