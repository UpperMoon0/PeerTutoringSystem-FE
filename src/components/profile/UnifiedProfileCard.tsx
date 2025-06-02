import React, { useState } from 'react';
import type { ProfileDto, UpdateProfileDto } from '@/types/user.types';
import type { AppUser } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import CollapsibleTutorSection from './CollapsibleTutorSection';
import { 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Mail, 
  Edit3,
  UserCheck,
  Clock
} from 'lucide-react';

interface UnifiedProfileCardProps {
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

const UnifiedProfileCard: React.FC<UnifiedProfileCardProps> = ({
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
  const [tutorSectionExpanded, setTutorSectionExpanded] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'tutor':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      case 'student':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="relative">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile Avatar" 
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover ring-4 ring-border shadow-xl" 
                  />
                ) : (
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-muted flex items-center justify-center ring-4 ring-border shadow-xl">
                    <User className="h-16 w-16 lg:h-20 lg:w-20 text-muted-foreground" />
                  </div>
                )}
                {/* Status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-card ${
                  profile.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
            </div>

            {/* Basic Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-white">{profile.fullName}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getRoleColor(profile.role)}>
                      {profile.role}
                    </Badge>
                    <Badge className={getStatusColor(profile.status)}>
                      {profile.status}
                    </Badge>
                  </div>
                </div>
                {canEdit && !isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="shrink-0"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <UserCheck className="h-5 w-5 text-blue-400" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date of Birth</p>
                    <p className="font-medium text-white">
                      {new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone Number</p>
                    <p className="font-medium text-white">{profile.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Gender</p>
                    <p className="font-medium text-white">{profile.gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Hometown</p>
                    <p className="font-medium text-white">{profile.hometown}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-400">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData?.fullName || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-400">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData?.email || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-400">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData?.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                      className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-400">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData?.phoneNumber || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-400">Gender</Label>
                    <Input
                      id="gender"
                      name="gender"
                      value={formData?.gender || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hometown" className="text-sm font-medium text-gray-400">Hometown</Label>
                    <Input
                      id="hometown"
                      name="hometown"
                      value={formData?.hometown || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="avatar" className="text-sm font-medium text-gray-400">Avatar</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    type="file"
                    onChange={handleInputChange}
                    className="mt-1 bg-gray-800 border-gray-700 text-white file:text-gray-400 file:bg-gray-700 file:border-none file:mr-2 file:px-2 file:py-1 file:rounded-md"
                    accept="image/*"
                  />
                  {avatarPreview && !selectedAvatarFile && (
                    <img
                      src={avatarPreview}
                      alt="Current Avatar"
                      className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                    />
                  )}
                  {selectedAvatarFile && avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="New Avatar Preview"
                      className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter className="flex justify-end space-x-2 border-t border-border pt-6">
              <Button variant="outline" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-semibold text-foreground">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profile Status</p>
                <p className="font-semibold text-foreground">{profile.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-semibold text-foreground">{profile.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutor Profile Section - Only visible for tutors */}
      {isTutorOwner && (
        <CollapsibleTutorSection
          userId={userId}
          currentUser={currentUser}
          profile={profile}
          isExpanded={tutorSectionExpanded}
          onToggleExpanded={setTutorSectionExpanded}
        />
      )}
    </div>
  );
};

export default UnifiedProfileCard;