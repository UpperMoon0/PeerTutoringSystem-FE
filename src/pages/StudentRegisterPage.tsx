import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Calendar as CalendarIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from '@/contexts/AuthContext';
import SocialLoginButtons from '@/components/common/SocialLoginButtons'; 

const StudentRegisterPage: React.FC = () => {
  const [date, setDate] = useState<Date>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, handleEmailRegister } = useAuth(); 
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Sign up as a student</CardTitle>
          <CardDescription>
            Already have an account?{' '} {}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          
          <SocialLoginButtons
            loading={formLoading} 
            setLoading={setFormLoading} 
            setError={setError}
            pageType="register"
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
            const name = formData.get('name') as string;
            const email = formData.get('email') as string;
            const phone = formData.get('phone') as string;
            const password = formData.get('password') as string;
            const confirmPassword = formData.get('confirm-password') as string;
            const gender = formData.get('gender') as string;
            const hometown = formData.get('hometown') as string;

            if (password !== confirmPassword) {
              setError("Passwords do not match.");
              setFormLoading(false);
              return;
            }
            if (!date) {
              setError("Please select your birthdate.");
              setFormLoading(false);
              return;
            }
            if (!gender) {
              setError("Please select your gender.");
              setFormLoading(false);
              return;
            }
             if (!hometown) {
              setError("Please enter your hometown.");
              setFormLoading(false);
              return;
            }


            const success = await handleEmailRegister({
              fullName: name,
              email,
              password,
              dateOfBirth: format(date, "yyyy-MM-dd"), 
              phoneNumber: phone,
              gender,
              hometown,
            });

            setFormLoading(false);
            if (success) {
              navigate('/');
            } else {
              setError("Registration failed. Please check your details or try again later.");
            }
          }}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input type="text" name="name" id="name" placeholder="Your Full Name" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dob">Birthdate</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal text-white" // Removed conditional muted-foreground
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-white" /> 
                      {date ? format(date, "dd/MM/yyyy") : <span>Select your birthdate</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1950}
                      toYear={new Date().getFullYear() - 10} 
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  name="gender"
                  id="gender"
                  required
                  defaultValue=""
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hometown">Hometown</Label>
                <Input type="text" name="hometown" id="hometown" placeholder="Your Hometown" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" name="email" id="email" placeholder="Your email" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input type="tel" name="phone" id="phone" placeholder="+084" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password (min. 8 characters)</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="Your password"
                    minLength={8}
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

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm-password"
                    id="confirm-password"
                    placeholder="Your password"
                    minLength={8}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </Button>
                </div>
              </div>
            </div>
            <CardFooter className="flex flex-col pt-6 px-0">
              <Button type="submit" className="w-full" disabled={formLoading}>
                {formLoading ? 'Signing up...' : 'Sign up'}
              </Button>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                By clicking Log in or Continue with, you agree to Preply
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

export default StudentRegisterPage;
