import React from 'react';
import { Button } from '@/components/ui/button';
import { AuthService } from '@/services/AuthService';
import { useNavigate } from 'react-router-dom';

interface SocialLoginButtonsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  pageType?: 'login' | 'register'; // To customize messages slightly
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  loading,
  setLoading,
  setError,
  pageType = 'login',
}) => {
  const navigate = useNavigate();

  const handleSocialLogin = async (loginProvider: () => Promise<any>) => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginProvider();
      if (result.success && result.idToken) {
        console.log(`Social ${pageType} successful, navigating...`);
        navigate('/');
      } else if (result.error) {
        setError(result.error.message || `Social ${pageType} failed. Please try again.`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 mb-6">
      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={() => handleSocialLogin(AuthService.loginWithGoogle)}
        disabled={loading}
      >
        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={() => handleSocialLogin(AuthService.loginWithFacebook)}
        disabled={loading}
      >
        <img src="https://img.icons8.com/color/16/000000/facebook-new.png" alt="Facebook" className="mr-2 h-4 w-4" />
        Continue with Facebook
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
