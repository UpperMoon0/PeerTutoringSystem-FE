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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/schemas/auth.schemas';
import type { LoginFormValues } from '@/schemas/auth.schemas';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, handleEmailLogin } = useAuth();
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/');
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading || formLoading) { 
    return <div className="flex justify-center items-center min-h-screen bg-gray-950 text-white">Loading...</div>;
  }
  
  if (currentUser) {
    return null;
  }

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setFormLoading(true);
    const success = await handleEmailLogin(data);
    setFormLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError("Login failed. Please check your credentials or try again later.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-300">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">Log in</CardTitle>
          <CardDescription className="text-gray-400">
            Don't have an account yet?{' '}
            <Link to="/register/student" className="font-medium text-blue-500 hover:text-blue-400">
              Sign up
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
          
          <SocialLoginButtons
            loading={formLoading}
            setLoading={setFormLoading}
            setError={setError}
            pageType="login"
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Your email"
                  {...register("email")}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Your password"
                    {...register("password")}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 flex items-center text-gray-500 hover:text-gray-300"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" name="remember-me" className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white" />
                  <Label htmlFor="remember-me" className="text-sm font-normal text-gray-300">
                    Remember me
                  </Label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-500 hover:text-blue-400">
                    Forgot your password?
                  </a>
                </div>
              </div>
            </div>
            <CardFooter className="flex flex-col pt-6 px-0">
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={formLoading}>
                {formLoading ? 'Logging in...' : 'Log in'}
              </Button>
              <p className="mt-6 text-center text-xs text-gray-400">
                By clicking Log in or Continue with, you agree to TheTutorGroup
                <a href="#" className="font-medium text-blue-500 hover:text-blue-400">
                  {' '}
                  Term of use
                </a>
                {' '}and
                <a href="#" className="font-medium text-blue-500 hover:text-blue-400">
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
