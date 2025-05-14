import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileService } from '@/services/ProfileService';
import { type ProfileDto, type UpdateProfileDto } from '@/types/Profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await ProfileService.getProfileByUserId(userId);
        if (result.success && result.data) {
          setProfile(result.data);
          setFormData({
            fullName: result.data.fullName,
            email: result.data.email,
            dateOfBirth: result.data.dateOfBirth,
            phoneNumber: result.data.phoneNumber,
            gender: result.data.gender,
            hometown: result.data.hometown,
            avatar: null, // Initialize avatar as null
          });
          if (result.data.avatarUrl) {
            setAvatarPreview(result.data.avatarUrl);
          }
        } else {
          let errorMessageText = 'Failed to fetch profile';
          if (result.error) {
            if (result.error instanceof Error) {
              errorMessageText = result.error.message;
            } else if (typeof result.error === 'string') {
              errorMessageText = result.error;
            }
          }
          setError(errorMessageText);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the profile.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (formData) {
      const { name, value } = e.target;
      if (name === 'avatar' && e.target instanceof HTMLInputElement && e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setSelectedAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setFormData({
          ...formData,
          avatar: file, // Store the file object
        });
      } else {
        setFormData({
          ...formData,
          [name]: name === 'hourlyRate' ? (value === '' ? 0 : parseFloat(value)) : value,
        });
      }
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (formData && date) {
      setFormData({
        ...formData,
        dateOfBirth: date.toISOString(),
      });
    }
  };

  const handleGenderChange = (value: string) => {
    if (formData) {
      setFormData({
        ...formData,
        gender: value,
      });
    }
  };

  const handleSave = async () => {
    if (!profile || !formData || !userId) return;

    const payloadToSave: UpdateProfileDto = {
        fullName: formData.fullName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        hometown: formData.hometown,
        avatar: selectedAvatarFile, // Pass the selected file
    };

    setLoading(true);
    setError(null);
    try {
      // Use userId (string) instead of profile.profileID (which was number and removed)
      const result = await ProfileService.updateProfile(userId, payloadToSave);
      if (result.success) {
        // Refetch profile data to ensure UI is up-to-date
        const updatedProfileResult = await ProfileService.getProfileByUserId(userId);
        if (updatedProfileResult.success && updatedProfileResult.data) {
            setProfile(updatedProfileResult.data);
            if (updatedProfileResult.data.avatarUrl) {
              setAvatarPreview(updatedProfileResult.data.avatarUrl);
            }
        }
        setIsEditing(false);
        setSelectedAvatarFile(null); // Reset selected file after save
      } else {
        let errorMessageText = 'Failed to update profile';
        if (result.error) {
            if (result.error instanceof Error) {
              errorMessageText = result.error.message;
            } else if (typeof result.error === 'string') {
              errorMessageText = result.error;
            }
          }
        setError(errorMessageText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the profile.');
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) return <div className="container mx-auto p-4">Loading profile...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  if (!profile) return <div className="container mx-auto p-4">Profile not found.</div>;

  const canEdit = currentUser?.userId === profile.userID || currentUser?.role === 'Admin';

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
            {/* profile.fullName should exist as it's required in UserDto/ProfileDto */}
            <h1 className="text-2xl font-bold">{profile.fullName}'s Profile</h1>
            {canEdit && !isEditing && (
                <Button onClick={() => {
                  setIsEditing(true);
                  // Reset form data to current profile data when entering edit mode
                  if (profile) {
                    setFormData({
                      fullName: profile.fullName,
                      email: profile.email,
                      dateOfBirth: profile.dateOfBirth,
                      phoneNumber: profile.phoneNumber,
                      gender: profile.gender,
                      hometown: profile.hometown,
                      avatar: null, // Reset avatar field
                    });
                    setAvatarPreview(profile.avatarUrl || null); // Set preview to current avatar
                    setSelectedAvatarFile(null); // Clear any previously selected file
                  }
                }}>Edit Profile</Button>
            )}
        </div>

        {isEditing && formData ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              <div className="mt-1 flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview || undefined} alt={profile.fullName} />
                  <AvatarFallback>{profile.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Input id="avatar" name="avatar" type="file" onChange={handleInputChange} className="mt-1" accept="image/*" />
              </div>
            </div>
            {/* Add form fields for the new properties from UpdateUserDto */}
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !formData.dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={handleGenderChange} value={formData.gender}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hometown">Hometown</Label>
              <Input id="hometown" name="hometown" value={formData.hometown} onChange={handleInputChange} className="mt-1" />
            </div>
            <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.avatarUrl && (
                <div className="flex flex-col items-center mb-4">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={profile.avatarUrl} alt={`${profile.fullName}'s avatar`} />
                        <AvatarFallback>{profile.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            )}
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Date of Birth:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
            <p><strong>Phone Number:</strong> {profile.phoneNumber || 'Not specified'}</p>
            <p><strong>Gender:</strong> {profile.gender || 'Not specified'}</p>
            <p><strong>Hometown:</strong> {profile.hometown || 'Not specified'}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Status:</strong> {profile.status}</p>
            {/* AvatarUrl is available in profile, can be displayed with an <img> tag */}
            {/* {profile.avatarUrl && <div className="mt-2"><p><strong>Avatar:</strong></p><img src={profile.avatarUrl} alt={`${profile.fullName}'s avatar`} className="w-24 h-24 rounded-full object-cover" /></div>} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
