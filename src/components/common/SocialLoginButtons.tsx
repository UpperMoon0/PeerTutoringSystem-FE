import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SocialLoginButtonsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  pageType?: 'login' | 'register';
}

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

    try {
      const success = await auth.handleGoogleLogin();
      if (success) {
        console.log(`Google ${pageType} successful, navigating...`);
        navigate('/');
      } else {
        setError(`Google ${pageType} failed. Please try again.`);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred during Google login.');
    } finally {
      setParentLoading(false);
    }
  };

  return (
    <div className="space-y-2 mb-6">
      <Button
        className="w-full flex items-center justify-center text-primary-foreground bg-gradient-to-r from-primary to-purple-600 hover:from-blue-600 hover:to-purple-700"
        onClick={handleGoogleAuthClick}
        disabled={parentLoading || auth.loading}
      >
        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" className="mr-2 h-4 w-4" />
        <span className="text-primary-foreground">Continue with Google</span>
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
