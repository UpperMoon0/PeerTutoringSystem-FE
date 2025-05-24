import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileService } from '../services/ProfileService';
import type { ProfileDto, UpdateProfileDto } from '@/types/user.types';
import { useAuth } from '../contexts/AuthContext';
import UserProfileCard from '../components/profile/UserProfileCard';

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
        } else {
          setError(result.error instanceof Error ? result.error.message : typeof result.error === 'string' ? result.error : (result.error && typeof result.error.message === 'string') ? result.error.message : 'Failed to fetch profile.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
      setLoading(false);
    };
    fetchProfileData();
  }, [userId, currentUser]);

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
        setError(result.error instanceof Error ? result.error.message : typeof result.error === 'string' ? result.error : (result.error && typeof result.error.message === 'string') ? result.error.message : 'Failed to update profile.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while updating profile.');
    }
    setLoading(false);
  };

  const handleCancelEdit = () => {
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
  };

  if (loading && !profile) return <div className="flex justify-center items-center h-screen"><p>Loading profile...</p></div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  if (!profile) return <div className="container mx-auto p-4">No profile data found.</div>;

  const canEdit = currentUser?.userId === profile.userID || currentUser?.role === 'Admin';

  return (
    <div className="container mx-auto p-4">
      <UserProfileCard
        profile={profile}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        formData={formData}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        handleSave={handleSave}
        avatarPreview={avatarPreview}
        selectedAvatarFile={selectedAvatarFile}
        loading={loading}
        canEdit={canEdit}
        onCancelEdit={handleCancelEdit}
        currentUser={currentUser}
        userId={userId || ''}
      />
    </div>
  );
};

export default UserProfilePage;
