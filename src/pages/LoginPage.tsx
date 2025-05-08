import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Checkbox from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/'); // Redirect to home if user is already logged in
    }
  }, [currentUser, authLoading, navigate]);

  const handleSocialLogin = async (loginProvider: () => Promise<any>) => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginProvider();
      if (result.success && result.idToken) {
        console.log('Login successful, navigating...');
        navigate('/'); 
      } else if (result.error) {
        setError(result.error.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  // If user is already logged in (checked by useEffect), this part might not be reached often,
  // but it's a safeguard.
  if (currentUser) {
    return null; // Or a redirect component
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Log in</CardTitle>
          <CardDescription>
            <Link to="/register/student" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up as student
            </Link>
            <span className="mx-1">Or</span>
            <Link to="/register/tutor" className="font-medium text-indigo-600 hover:text-indigo-500"> {}
              Sign up as a tutor
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <div className="space-y-2 mb-6">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center text-primary-foreground"
              onClick={() => handleSocialLogin(AuthService.loginWithGoogle)}
              disabled={loading}
            >
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center text-primary-foreground"
              onClick={() => handleSocialLogin(AuthService.loginWithFacebook)}
              disabled={loading}
            >
              <img src="https://img.icons8.com/color/16/000000/facebook-new.png" alt="Facebook" className="mr-2 h-4 w-4" />
              Continue with Facebook
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or</span>
            </div>
          </div>

          <form>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Your email"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="Your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" name="remember-me" />
                  <Label htmlFor="remember-me" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </a>
                </div>
              </div>
            </div>
            <CardFooter className="flex flex-col pt-6 px-0">
              <Button type="submit" className="w-full">
                Log in
              </Button>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                By clicking Log in or Continue with, you agree to TheTutorGroup
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  {' '}
                  Term of use
                </a>
                {' '}and
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  {' '}
                  Privacy Policy
                </a>
              </p>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
