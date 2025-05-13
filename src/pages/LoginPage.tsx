import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; 
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
import { useAuth } from '@/contexts/AuthContext';
import SocialLoginButtons from '@/components/common/SocialLoginButtons'; 

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, handleEmailLogin } = useAuth(); 
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/');
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading || formLoading) { 
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (currentUser) {
    return null;
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          
          <SocialLoginButtons
            loading={formLoading} 
            setLoading={setFormLoading} 
            setError={setError}
            pageType="login"
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setFormLoading(true);
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            if (!email || !password) {
              setError("Email and password are required.");
              setFormLoading(false);
              return;
            }

            const success = await handleEmailLogin({ email, password });
            setFormLoading(false);
            if (success) {
              navigate('/');
            } else {
              setError("Login failed. Please check your credentials or try again later.");
            }
          }}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Your email"
                  required
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
                    required
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
              <Button type="submit" className="w-full" disabled={formLoading}>
                {formLoading ? 'Logging in...' : 'Log in'}
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
