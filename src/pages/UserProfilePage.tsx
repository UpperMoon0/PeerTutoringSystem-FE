import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileService } from '@/services/ProfileService';
import { type ProfileDto, type UpdateProfileDto } from '@/types/Profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          });
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
      setFormData({
        ...formData,
        [name]: name === 'hourlyRate' ? (value === '' ? 0 : parseFloat(value)) : value,
      });
    }
  };

  const handleSave = async () => {
    if (!profile || !formData || !userId) return;

    // Construct payloadToSave based on the new UpdateProfileDto structure
    const payloadToSave: UpdateProfileDto = {
        fullName: formData.fullName, 
        email: formData.email, 
        dateOfBirth: formData.dateOfBirth, 
        phoneNumber: formData.phoneNumber, 
        gender: formData.gender, 
        hometown: formData.hometown, 
        // avatar: formData.avatar, // Handle file upload separately if/when implemented
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
        }
        setIsEditing(false);
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

  // profile.userID should exist if profile is not null, as it's a required field in UserDto/ProfileDto
  const canEdit = currentUser?.userId === profile.userID || currentUser?.role === 'Admin';

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
            {/* profile.fullName should exist as it's required in UserDto/ProfileDto */}
            <h1 className="text-2xl font-bold">{profile.fullName}'s Profile</h1>
            {canEdit && !isEditing && (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
        </div>

        {isEditing && formData ? (
          <div className="space-y-4">
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
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Input id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="hometown">Hometown</Label>
              <Input id="hometown" name="hometown" value={formData.hometown} onChange={handleInputChange} className="mt-1" />
            </div>
            {/* Add Avatar upload field if needed - IFormFile on backend */}
            {/* <div>
              <Label htmlFor="avatar">Avatar</Label>
              <Input id="avatar" name="avatar" type="file" onChange={(e) => setFormData({...formData, avatar: e.target.files ? e.target.files[0] : null})} className="mt-1" />
            </div> */}
            <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Date of Birth:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
            <p><strong>Phone Number:</strong> {profile.phoneNumber || 'Not specified'}</p>
            <p><strong>Gender:</strong> {profile.gender || 'Not specified'}</p>
            <p><strong>Hometown:</strong> {profile.hometown || 'Not specified'}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Status:</strong> {profile.status}</p>
            {/* AvatarUrl is available in profile, can be displayed with an <img> tag */}
            {profile.avatarUrl && <div className="mt-2"><p><strong>Avatar:</strong></p><img src={profile.avatarUrl} alt={`${profile.fullName}'s avatar`} className="w-24 h-24 rounded-full object-cover" /></div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
