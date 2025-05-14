import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileService } from '@/services/ProfileService';
import type { ProfileDto, UpdateProfileDto } from '@/types/Profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
            hourlyRate: result.data.hourlyRate,
            bio: result.data.bio,
            experience: result.data.experience,
            availability: result.data.availability,
          });
        } else {
          setError(result.error || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('An error occurred while fetching the profile.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!profile || !formData) return;
    setLoading(true);
    setError(null);
    try {
      const result = await ProfileService.updateProfile(profile.profileID, formData);
      if (result.success) {
        const updatedProfileResult = await ProfileService.getProfileByUserId(profile.userID);
        if (updatedProfileResult.success && updatedProfileResult.data) {
            setProfile(updatedProfileResult.data);
        }
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating the profile.');
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
            <h1 className="text-2xl font-bold">{profile.tutorName}'s Profile</h1>
            {canEdit && !isEditing && (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
        </div>

        {isEditing && formData ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Textarea id="experience" name="experience" value={formData.experience} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <Input id="hourlyRate" name="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleInputChange} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Input id="availability" name="availability" value={formData.availability} onChange={handleInputChange} className="mt-1" />
            </div>
            <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p><strong>Bio:</strong> {profile.bio || 'Not specified'}</p>
            <p><strong>Experience:</strong> {profile.experience || 'Not specified'}</p>
            <p><strong>Hourly Rate:</strong> ${profile.hourlyRate.toFixed(2)}</p>
            <p><strong>Availability:</strong> {profile.availability || 'Not specified'}</p>
            {profile.school && <p><strong>School:</strong> {profile.school}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
