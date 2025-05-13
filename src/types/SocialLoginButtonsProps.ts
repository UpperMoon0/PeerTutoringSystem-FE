export interface SocialLoginButtonsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  pageType?: 'login' | 'register';
}
