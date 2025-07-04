import React from 'react';
import { Link } from 'react-router-dom';
import type { EnrichedTutor } from '@/types/enrichedTutor.types';
import StarRating from '@/components/ui/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateGradient, getInitials } from '@/lib/utils';

interface TutorCardProps {
  tutor: EnrichedTutor;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {

  return (
    <div className="border border-border p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow bg-card flex flex-col h-full">
      <div className="mx-auto mb-3">
        <Avatar className="w-24 h-24 border-2 border-accent">
          <AvatarImage src={tutor.avatarUrl} alt={tutor.fullName} />
          <AvatarFallback
            className={`bg-gradient-to-br ${generateGradient(tutor.fullName)} text-primary-foreground text-2xl font-bold`}
          >
            {getInitials(tutor.fullName)}
          </AvatarFallback>
        </Avatar>
      </div>
      <h2 className="text-xl font-semibold text-center mb-2 text-foreground">{tutor.fullName}</h2>
      
      {/* Rating Section */}
      <div className="text-center mb-3">
        <StarRating
          rating={tutor.averageRating}
          reviewCount={tutor.reviewCount}
          size="sm"
          className="justify-center"
        />
      </div>

      <div className="flex-grow">
        <div className="text-sm text-muted-foreground mt-2 space-y-1">
          {tutor.bio && (
            <p className="truncate" title={tutor.bio}>
              <strong className="text-foreground">Bio:</strong> {tutor.bio.substring(0, 80)}{tutor.bio.length > 80 ? '...' : ''}
            </p>
          )}
          {tutor.experience && (
            <p>
              <strong className="text-foreground">Experience:</strong> {tutor.experience}
            </p>
          )}
          {tutor.hourlyRate !== undefined && (
            <p>
              <strong className="text-foreground">Rate:</strong> ${tutor.hourlyRate}/hr
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <h3 className="text-md font-semibold text-foreground mb-1">Skills:</h3>
          {tutor.skills.length === 0 ? (
            <p className="text-xs text-muted-foreground">No skills listed.</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {tutor.skills.map((userSkill) => (
                <span key={userSkill.userSkillID} className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                  {userSkill.skill.skillName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-4 pt-2 border-t border-border">
        <Link to={`/tutors/${tutor.userID}`} className="text-primary hover:text-primary/90 hover:underline font-medium">
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default TutorCard;
