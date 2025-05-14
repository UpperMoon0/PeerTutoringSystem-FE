import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileService } from '../services/ProfileService';
import type { ProfileDto, UpdateProfileDto } from '../types/Profile';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { PlusCircle } from 'lucide-react';

// Imports for Tutor Profile
import { TutorProfileService } from '../services/TutorProfileService';
import type { TutorProfileDto, CreateTutorProfileDto, UpdateTutorProfileDto as UpdateTutorDtoInternal } from '../types/TutorProfile';
import TutorProfileDisplay from '../components/profile/TutorProfileDisplay';
import TutorProfileForm from '../components/profile/TutorProfileForm';

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

  // State for Tutor Profile
  const [tutorProfile, setTutorProfile] = useState<TutorProfileDto | null>(null);
  const [isEditingTutorProfile, setIsEditingTutorProfile] = useState(false);
  const [tutorProfileLoading, setTutorProfileLoading] = useState(false);
  const [tutorProfileError, setTutorProfileError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }
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
            avatar: null, 
          });
          setAvatarPreview(result.data.avatarUrl || null);

          if (result.data.role === 'Tutor' && currentUser?.userId === result.data.userID) {
            await fetchTutorProfileData(userId);
          }
        } else {
          setError(result.error instanceof Error ? result.error.message : result.error || 'Failed to fetch profile.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
      setLoading(false);
    };
    fetchProfileData();
  }, [userId, currentUser]);

  const fetchTutorProfileData = async (currentUserId: string) => {
    setTutorProfileLoading(true);
    setTutorProfileError(null);
    try {
      const tutorResult = await TutorProfileService.getTutorProfileByUserId(currentUserId);
      if (tutorResult.success && tutorResult.data) {
        setTutorProfile(tutorResult.data);
      } else if (tutorResult.error && (tutorResult.error instanceof Error ? tutorResult.error.message : tutorResult.error).includes("not found")) {
        setTutorProfile(null);
      } else {
        setTutorProfileError(tutorResult.error instanceof Error ? tutorResult.error.message : tutorResult.error || 'Failed to fetch tutor profile.');
      }
    } catch (err) {
      setTutorProfileError(err instanceof Error ? err.message : 'An unknown error occurred while fetching tutor profile.');
    }
    setTutorProfileLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (formData) {
      const { name, value } = e.target;
      if (name === 'avatar' && e.target instanceof HTMLInputElement && e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setSelectedAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
      } else {
        setFormData({ ...formData, [name]: value });
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

  const handleSave = async () => {
    if (!profile || !formData || !userId) return;

    const payloadToSave: UpdateProfileDto = {
        fullName: formData.fullName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        hometown: formData.hometown,
        avatar: selectedAvatarFile, 
    };

    setLoading(true);
    setError(null);
    try {
      const result = await ProfileService.updateProfile(userId, payloadToSave);
      if (result.success) {
        const updatedProfileResult = await ProfileService.getProfileByUserId(userId);
        if (updatedProfileResult.success && updatedProfileResult.data) {
          setProfile(updatedProfileResult.data);
          setAvatarPreview(updatedProfileResult.data.avatarUrl || null); 
        }
        setIsEditing(false);
        setSelectedAvatarFile(null); 
      } else {
        setError(result.error instanceof Error ? result.error.message : result.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while updating profile.');
    }
    setLoading(false);
  };

  const handleCreateTutorProfile = () => {
    setIsEditingTutorProfile(true);
    setTutorProfile(null); 
  };

  const handleEditTutorProfile = () => {
    setIsEditingTutorProfile(true);
  };

  const handleCancelTutorProfileEdit = () => {
    setIsEditingTutorProfile(false);
    if (profile && profile.role === 'Tutor' && userId) {
        fetchTutorProfileData(userId);
    }
  };

  const handleSaveTutorProfile = async (data: CreateTutorProfileDto | UpdateTutorDtoInternal) => {
    if (!userId) {
      setTutorProfileError("User ID is missing.");
      return;
    }
    setTutorProfileLoading(true);
    setTutorProfileError(null);
    try {
      let result;
      if (tutorProfile && tutorProfile.profileId) { 
        result = await TutorProfileService.updateTutorProfile(tutorProfile.profileId, data as UpdateTutorDtoInternal);
      } else { 
        result = await TutorProfileService.createTutorProfile(data as CreateTutorProfileDto);
      }

      if (result.success && result.data) {
        setTutorProfile(result.data);
        setIsEditingTutorProfile(false);
      } else {
        setTutorProfileError(result.error instanceof Error ? result.error.message : result.error || 'Failed to save tutor profile.');
      }
    } catch (err) {
      setTutorProfileError(err instanceof Error ? err.message : 'An unknown error occurred while saving tutor profile.');
    }
    setTutorProfileLoading(false);
  };

  if (loading && !profile) return <div className="flex justify-center items-center h-screen"><p>Loading profile...</p></div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  if (!profile) return <div className="container mx-auto p-4">No profile data found.</div>;

  const canEdit = currentUser?.userId === profile.userID || currentUser?.role === 'Admin';
  const isTutor = profile.role === 'Tutor' && currentUser?.userId === profile.userID;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold">User Profile</CardTitle>
            {canEdit && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardHeader>
        {!isEditing ? (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 flex flex-col items-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-40 h-40 rounded-full object-cover mb-4 shadow-md" />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 mb-4 shadow-md">
                    No Avatar
                  </div>
                )}
                <p className="text-2xl font-semibold">{profile.fullName}</p>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
              <div className="md:col-span-2 space-y-3">
                <p><strong className="font-medium">Date of Birth:</strong> {new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                <p><strong className="font-medium">Phone Number:</strong> {profile.phoneNumber}</p>
                <p><strong className="font-medium">Gender:</strong> {profile.gender}</p>
                <p><strong className="font-medium">Hometown:</strong> {profile.hometown}</p>
                <p><strong className="font-medium">Role:</strong> {profile.role}</p>
                <p><strong className="font-medium">Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${profile.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{profile.status}</span></p>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" value={formData?.fullName || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData?.email || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input 
                  id="dateOfBirth" 
                  name="dateOfBirth" 
                  type="date" 
                  value={formData?.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''} 
                  onChange={(e) => handleDateChange(e.target.value ? new Date(e.target.value) : undefined)} 
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData?.phoneNumber || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" name="gender" value={formData?.gender || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="hometown">Hometown</Label>
                <Input id="hometown" name="hometown" value={formData?.hometown || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar</Label>
                <Input id="avatar" name="avatar" type="file" onChange={handleInputChange} />
                {avatarPreview && !selectedAvatarFile && <img src={avatarPreview} alt="Current Avatar" className="mt-2 w-20 h-20 rounded-full object-cover" />}
                {selectedAvatarFile && avatarPreview && <img src={avatarPreview} alt="New Avatar Preview" className="mt-2 w-20 h-20 rounded-full object-cover" />}
              </div>
            </div>
          </CardContent>
        )}
        {isEditing && (
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => { 
              setIsEditing(false); 
              if (profile) {
                setFormData({
                  fullName: profile.fullName,
                  email: profile.email,
                  dateOfBirth: profile.dateOfBirth,
                  phoneNumber: profile.phoneNumber,
                  gender: profile.gender,
                  hometown: profile.hometown,
                  avatar: null,
                });
                setAvatarPreview(profile.avatarUrl || null);
                setSelectedAvatarFile(null);
              }
            }}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </CardFooter>
        )}
      </Card>

      {isTutor && (
        <div className="mt-8">
          {tutorProfileLoading && <div className="flex justify-center items-center"><p>Loading tutor profile...</p></div>}
          {tutorProfileError && <p className="text-red-500">Error: {tutorProfileError}</p>}

          {!tutorProfileLoading && !tutorProfileError && (
            <>
              {isEditingTutorProfile ? (
                <TutorProfileForm
                  initialData={tutorProfile}
                  onSubmit={handleSaveTutorProfile}
                  onCancel={handleCancelTutorProfileEdit}
                  isLoading={tutorProfileLoading}
                />
              ) : tutorProfile ? (
                <TutorProfileDisplay
                  tutorProfile={tutorProfile}
                  onEdit={handleEditTutorProfile}
                  canEdit={isTutor} 
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Tutor Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>You do not have a tutor profile yet. Create one to offer your tutoring services.</p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleCreateTutorProfile}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Create Tutor Profile
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
