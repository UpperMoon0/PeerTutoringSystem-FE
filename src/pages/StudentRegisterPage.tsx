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
import { Eye, EyeOff, CalendarIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SocialLoginButtons from '@/components/common/SocialLoginButtons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentRegisterSchema, type StudentRegisterFormValues } from '@/schemas/auth.schemas';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StudentRegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, handleEmailRegister } = useAuth();
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<StudentRegisterFormValues>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      gender: "", // Set a default value for gender if needed
    }
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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

  const onSubmit = async (data: StudentRegisterFormValues) => {
    setError(null);
    setFormLoading(true);

    const payload = {
      fullName: data.name,
      email: data.email,
      password: data.password,
      dateOfBirth: format(data.birthdate, "yyyy-MM-dd"),
      phoneNumber: data.phone,
      gender: data.gender,
      hometown: data.hometown,
    };

    const success = await handleEmailRegister(payload);

    setFormLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError("Registration failed. Please check your details or try again later.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-300 py-12">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">Sign up</CardTitle>
          <CardDescription className="text-gray-400">
            Already have an account?{' '} {}
            <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
              Log in
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
          
          <SocialLoginButtons
            loading={formLoading}
            setLoading={setFormLoading}
            setError={setError}
            pageType="register"
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
                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                <Input type="text" id="name" placeholder="Your Full Name" {...register("name")} className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthdate" className="text-gray-300">Birthdate</Label>
                <Controller
                  name="birthdate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${!field.value && "text-gray-500"} bg-gray-800 border-gray-700 hover:bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                          {field.value ? format(field.value, "PPP") : <span className="text-gray-500">Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-800 text-white">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="bg-gray-800"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.birthdate && <p className="text-red-400 text-xs mt-1">{errors.birthdate.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gender" className="text-gray-300">Gender</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="gender" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-800 text-white">
                        <SelectItem value="Male" className="hover:bg-gray-700 focus:bg-gray-700">Male</SelectItem>
                        <SelectItem value="Female" className="hover:bg-gray-700 focus:bg-gray-700">Female</SelectItem>
                        <SelectItem value="Other" className="hover:bg-gray-700 focus:bg-gray-700">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hometown" className="text-gray-300">Hometown</Label>
                <Input type="text" id="hometown" placeholder="Your Hometown" {...register("hometown")} className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500" />
                {errors.hometown && <p className="text-red-400 text-xs mt-1">{errors.hometown.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input type="email" id="email" placeholder="Your email" {...register("email")} className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-gray-300">Phone number</Label>
                <Input type="tel" id="phone" placeholder="+084" {...register("phone")} className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500" />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-300">Password (min. 6 characters)</Label>
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
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 flex items-center text-gray-500 hover:text-gray-300"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
            <CardFooter className="flex flex-col pt-6 px-0">
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={formLoading}>
                {formLoading ? 'Signing up...' : 'Sign up'}
              </Button>
              <p className="mt-6 text-center text-xs text-gray-400">
                By clicking Sign up or Continue with, you agree to TheTutorGroup
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

export default StudentRegisterPage;
