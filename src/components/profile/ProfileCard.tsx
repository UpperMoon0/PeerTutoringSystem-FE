import React from 'react';
import type { ProfileDto, UpdateProfileDto } from '@/types/user.types';
import type { AppUser } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateGradient, getInitials } from '@/lib/utils';

interface ProfileCardProps {
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

const ProfileCard: React.FC<ProfileCardProps> = ({
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
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover ring-4 ring-border shadow-xl">
                  <AvatarImage src={avatarPreview || ''} alt={profile.fullName} />
                  <AvatarFallback
                    className={`bg-gradient-to-br ${generateGradient(profile.fullName)} text-primary-foreground text-5xl font-bold`}
                  >
                    {getInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>
                {/* Status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-card ${
                  profile.status === 'Active' ? 'bg-green-500' : 'bg-muted'
                }`} />
              </div>
            </div>

            {/* Basic Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">{profile.fullName}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
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
        <Card className="lg:col-span-2 bg-card-secondary border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <UserCheck className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium text-foreground">
                      {new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium text-foreground">{profile.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium text-foreground">{profile.gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hometown</p>
                    <p className="font-medium text-foreground">{profile.hometown}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData?.fullName || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData?.email || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData?.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                      className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData?.phoneNumber || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender" className="text-sm font-medium text-muted-foreground">Gender</Label>
                    <Input
                      id="gender"
                      name="gender"
                      value={formData?.gender || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hometown" className="text-sm font-medium text-muted-foreground">Hometown</Label>
                    <Input
                      id="hometown"
                      name="hometown"
                      value={formData?.hometown || ''}
                      onChange={handleInputChange}
                      className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="avatar" className="text-sm font-medium text-muted-foreground">Avatar</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    type="file"
                    onChange={handleInputChange}
                    className="mt-1 bg-input border-border text-foreground file:text-muted-foreground file:bg-muted file:border-none file:mr-2 file:px-2 file:py-1 file:rounded-md"
                    accept="image/*"
                  />
                  {avatarPreview && !selectedAvatarFile && (
                    <img
                      src={avatarPreview}
                      alt="Current Avatar"
                      className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                  )}
                  {selectedAvatarFile && avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="New Avatar Preview"
                      className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-border"
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
        <Card className="bg-card-secondary border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
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
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserCheck className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profile Status</p>
                <p className="font-semibold text-foreground">{profile.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <User className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-semibold text-foreground">{profile.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutor Profile Section has been moved to TutorDashboardPage */}
    </div>
  );
};

export default ProfileCard;