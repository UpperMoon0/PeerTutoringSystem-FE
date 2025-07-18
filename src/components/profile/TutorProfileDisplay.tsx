import * as React from 'react';
import type { TutorProfileDto } from '../../types/TutorProfile';
import type { UserSkill } from '../../types/skill.types'; // Added
import SkillCard from '../common/SkillCard'; // Added
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Clock,
  DollarSign,
  User,
  Calendar,
  BookOpen
} from 'lucide-react';

interface TutorProfileDisplayProps {
  tutorProfile: TutorProfileDto;
}

const TutorProfileDisplay: React.FC<TutorProfileDisplayProps> = ({ tutorProfile }: { tutorProfile: TutorProfileDto }) => {
  return (
    <div className="space-y-6">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bio Section */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
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
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-500" />
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
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Availability</p>
                <p className="font-semibold text-foreground">{tutorProfile.availability}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-500" />
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
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tutorProfile.skills.map((userSkill: UserSkill) => (
                <SkillCard
                  key={userSkill.userSkillID}
                  skill={userSkill.skill}
                  isDisplayMode={true} // Use display mode instead of disabled
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TutorProfileDisplay;
