import { useState, useEffect } from 'react';
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
import { BirthdateCalendar } from "@/components/ui/birthdate-calendar";
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
    return <div className="flex justify-center items-center min-h-screen bg-background text-foreground">Loading...</div>;
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground py-12">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">Sign up</CardTitle>
          <CardDescription className="text-muted-foreground">
            Already have an account?{' '} {}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              Log in
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}
          
          <SocialLoginButtons
            loading={formLoading}
            setLoading={setFormLoading}
            setError={setError}
            pageType="register"
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
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input type="text" id="name" placeholder="Your Full Name" {...register("name")} className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring" />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthdate" className="text-foreground">Birthdate</Label>
                <Controller
                  name="birthdate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"} bg-input border-border hover:bg-input/80 text-foreground focus:ring-ring focus:border-ring`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {field.value ? format(field.value, "PPP") : <span className="text-muted-foreground">Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border-border text-foreground">
                        <BirthdateCalendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="bg-card-secondary"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.birthdate && <p className="text-destructive text-xs mt-1">{errors.birthdate.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gender" className="text-foreground">Gender</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="gender" className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="Male" className="hover:bg-card-secondary focus:bg-card-secondary">Male</SelectItem>
                        <SelectItem value="Female" className="hover:bg-card-secondary focus:bg-card-secondary">Female</SelectItem>
                        <SelectItem value="Other" className="hover:bg-card-secondary focus:bg-card-secondary">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && <p className="text-destructive text-xs mt-1">{errors.gender.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hometown" className="text-foreground">Hometown</Label>
                <Input type="text" id="hometown" placeholder="Your Hometown" {...register("hometown")} className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring" />
                {errors.hometown && <p className="text-destructive text-xs mt-1">{errors.hometown.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input type="email" id="email" placeholder="Your email" {...register("email")} className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring" />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-foreground">Phone number</Label>
                <Input type="tel" id="phone" placeholder="+084" {...register("phone")} className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring" />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-foreground">Password (min. 6 characters)</Label>
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
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
            <CardFooter className="flex flex-col pt-6 px-0">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={formLoading}>
                {formLoading ? 'Signing up...' : 'Sign up'}
              </Button>
              <p className="mt-6 text-center text-xs text-muted-foreground">
                By clicking Sign up or Continue with, you agree to TheTutorGroup
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

export default StudentRegisterPage;
