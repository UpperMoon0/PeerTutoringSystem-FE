import React from 'react';
import type { ProfileDto, UpdateProfileDto } from '@/types/user.types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import TutorProfileSection from './TutorProfileSection'; 
import type { AppUser } from '../../contexts/AuthContext'; 

interface UserProfileCardProps {
  profile: ProfileDto;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formData: UpdateProfileDto | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleSave: () => Promise<void>;
  avatarPreview: string | null;
  selectedAvatarFile: File | null;
  loading: boolean;
  canEdit: boolean;
  onCancelEdit: () => void;
  currentUser: AppUser | null; 
  userId: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  isEditing,
  setIsEditing,
  formData,
  handleInputChange,
  handleDateChange,
  handleSave,
  avatarPreview,
  selectedAvatarFile,
  loading,
  canEdit,
  onCancelEdit,
  currentUser,
  userId,
}) => {
  const isTutorOwner = profile.role === 'Tutor' && currentUser?.userId === profile.userID;

  return (
    <Card className="mb-6 bg-gray-900 border-gray-800 text-white">
      <CardHeader className="border-b border-gray-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-bold text-white">User Profile</CardTitle>
          {canEdit && !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >Edit Profile</Button>
          )}
        </div>
      </CardHeader>
      {!isEditing ? (
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-40 h-40 rounded-full object-cover mb-4 shadow-md border-2 border-gray-700" />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 mb-4 shadow-md border-2 border-gray-700">
                  No Avatar
                </div>
              )}
              <p className="text-2xl font-semibold text-white">{profile.fullName}</p>
              <p className="text-gray-400">{profile.email}</p>
            </div>
            <div className="md:col-span-2 space-y-3 text-gray-300">
              <p><strong className="font-medium text-white">Date of Birth:</strong> {new Date(profile.dateOfBirth).toLocaleDateString()}</p>
              <p><strong className="font-medium text-white">Phone Number:</strong> {profile.phoneNumber}</p>
              <p><strong className="font-medium text-white">Gender:</strong> {profile.gender}</p>
              <p><strong className="font-medium text-white">Hometown:</strong> {profile.hometown}</p>
              <p><strong className="font-medium text-white">Role:</strong> {profile.role}</p>
              <p><strong className="font-medium text-white">Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${profile.status === 'Active' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>{profile.status}</span></p>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="fullName" className="text-gray-400">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData?.fullName || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-1" />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-400">Email</Label>
              <Input id="email" name="email" type="email" value={formData?.email || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-1" />
            </div>
            <div>
              <Label htmlFor="dateOfBirth" className="text-gray-400">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData?.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber" className="text-gray-400">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" value={formData?.phoneNumber || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-1" />
            </div>
            <div>
              <Label htmlFor="gender" className="text-gray-400">Gender</Label>
              <Input id="gender" name="gender" value={formData?.gender || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-1" />
            </div>
            <div>
              <Label htmlFor="hometown" className="text-gray-400">Hometown</Label>
              <Input id="hometown" name="hometown" value={formData?.hometown || ''} onChange={handleInputChange} className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-1" />
            </div>
            <div>
              <Label htmlFor="avatar" className="text-gray-400">Avatar</Label>
              <Input id="avatar" name="avatar" type="file" onChange={handleInputChange} className="bg-gray-800 border-gray-700 text-white file:text-gray-400 file:bg-gray-700 file:border-none file:mr-2 file:px-2 file:py-1 file:rounded-md mt-1" />
              {avatarPreview && !selectedAvatarFile && <img src={avatarPreview} alt="Current Avatar" className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-gray-700" />}
              {selectedAvatarFile && avatarPreview && <img src={avatarPreview} alt="New Avatar Preview" className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-gray-700" />}
            </div>
          </div>
        </CardContent>
      )}
      {isEditing && (
        <CardFooter className="flex justify-end space-x-2 pt-6 border-t border-gray-800">
          <Button variant="outline" onClick={onCancelEdit} className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      )}

      {isTutorOwner && userId && (
        <TutorProfileSection userId={userId} currentUser={currentUser} profile={profile} />
      )}
    </Card>
  );
};

export default UserProfileCard;
