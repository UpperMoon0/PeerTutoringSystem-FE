import React from 'react';
import type { TutorProfileDto } from '../../types/TutorProfile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Clock,
  DollarSign,
  User,
  Calendar,
  Star,
  Edit3,
  BookOpen
} from 'lucide-react';

interface TutorProfileDisplayProps {
  tutorProfile: TutorProfileDto;
  onEdit: () => void;
  canEdit: boolean;
}

const TutorProfileDisplay: React.FC<TutorProfileDisplayProps> = ({ tutorProfile, onEdit, canEdit }) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Your Tutor Profile</h2>
          <p className="text-muted-foreground">This is how students will see your profile</p>
        </div>
        {canEdit && (
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bio Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              About Me
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Bio</h4>
              <p className="text-muted-foreground leading-relaxed">{tutorProfile.bio}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Experience</h4>
              <p className="text-muted-foreground leading-relaxed">{tutorProfile.experience}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p className="font-semibold text-foreground">
                  {typeof tutorProfile.hourlyRate === 'number'
                    ? `$${tutorProfile.hourlyRate.toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Availability</p>
                <p className="font-semibold text-foreground">{tutorProfile.availability}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-semibold text-foreground">
                  {new Date(tutorProfile.createdDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Section */}
      {tutorProfile.skills && tutorProfile.skills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tutorProfile.skills.map((userSkill) => (
                <div
                  key={userSkill.userSkillID}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{userSkill.skill.skillName}</p>
                    <p className="text-sm text-muted-foreground">Level: {userSkill.skill.skillLevel}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-foreground">
                      {userSkill.skill.skillLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TutorProfileDisplay;
