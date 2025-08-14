import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileService } from '../services/ProfileService';
import type { ProfileDto, UpdateProfileDto } from '@/types/user.types';
import { useAuth } from '../contexts/AuthContext';
import ProfileCard from '../components/profile/ProfileCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, updateCurrentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

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
        setFormData({ ...formData, avatar: file });
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
            // Update the global user state
            updateCurrentUser({
              fullName: updatedProfileResult.data.fullName,
              avatarUrl: updatedProfileResult.data.avatarUrl,
            });
          }
          setIsEditing(false);
          setSelectedAvatarFile(null);
          setDialogTitle("Success");
          setDialogDescription("Profile updated successfully.");
          setDialogOpen(true);
        } else {
          const errorMessage = result.error instanceof Error ? result.error.message : typeof result.error === 'string' ? result.error : (result.error && typeof result.error.message === 'string') ? result.error.message : 'Failed to update profile.';
          setDialogTitle("Error");
          setDialogDescription(errorMessage);
          setDialogOpen(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while updating profile.';
        setDialogTitle("Error");
        setDialogDescription(errorMessage);
        setDialogOpen(true);
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

  if (loading && !profile) return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-foreground">Loading profile...</p>
      </div>
    </div>
  );
  if (!profile) return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <div className="text-center py-12">
        <p className="text-muted-foreground">No profile data found.</p>
      </div>
    </div>
  );

  const canEdit = currentUser?.userId === profile.userID || currentUser?.role === 'Admin';

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <ProfileCard
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
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserProfilePage;
