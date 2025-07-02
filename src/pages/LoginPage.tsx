import { useState, useEffect } from 'react';
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
    return <div className="flex justify-center items-center min-h-screen bg-background text-foreground">Loading...</div>;
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">Log in</CardTitle>
          <CardDescription className="text-muted-foreground">
            Don't have an account yet?{' '}
            <Link to="/register/student" className="font-medium text-primary hover:text-primary/80">
              Sign up
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}
          
          <SocialLoginButtons
            loading={formLoading}
            setLoading={setFormLoading}
            setError={setError}
            pageType="login"
          />

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Your email"
                  {...register("email")}
                  className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Your password"
                    {...register("password")}
                    className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" name="remember-me" className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                  <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground">
                    Remember me
                  </Label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary/80">
                    Forgot your password?
                  </a>
                </div>
              </div>
            </div>
            <CardFooter className="flex flex-col pt-6 px-0">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={formLoading}>
                {formLoading ? 'Logging in...' : 'Log in'}
              </Button>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                By clicking Log in or Continue with, you agree to TheTutorGroup
                <a href="#" className="font-medium text-primary hover:text-primary/80">
                  {' '}
                  Term of use
                </a>
                {' '}and
                <a href="#" className="font-medium text-primary hover:text-primary/80">
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
