import React from 'react';
import type { ProfileDto, UpdateProfileDto } from '../../types/Profile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';

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
}) => {
  return (
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
          <Button variant="outline" onClick={onCancelEdit}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default UserProfileCard;
