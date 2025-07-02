import React from 'react';
import { Link } from 'react-router-dom';
import type { EnrichedTutor } from '@/types/enrichedTutor.types';
import StarRating from '@/components/ui/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TutorCardProps {
  tutor: EnrichedTutor;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {

  // Generate a consistent gradient color based on the tutor's name
  const generateGradient = (name: string) => {
    const colors = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-indigo-400',
      'from-green-400 to-teal-400',
      'from-yellow-400 to-orange-400',
      'from-red-400 to-pink-400',
      'from-indigo-400 to-purple-400',
      'from-teal-400 to-blue-400',
      'from-orange-400 to-red-400',
      'from-pink-400 to-purple-400',
      'from-cyan-400 to-blue-400'
    ];
    
    // Generate a hash from the name to pick a consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="border border-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow bg-gray-900 flex flex-col h-full">
      <div className="mx-auto mb-3">
        <Avatar className="w-24 h-24 border-2 border-gray-700">
          <AvatarImage src={tutor.avatarUrl} alt={tutor.fullName} />
          <AvatarFallback
            className={`bg-gradient-to-br ${generateGradient(tutor.fullName)} text-white text-2xl font-bold`}
          >
            {getInitials(tutor.fullName)}
          </AvatarFallback>
        </Avatar>
      </div>
      <h2 className="text-xl font-semibold text-center mb-2 text-white">{tutor.fullName}</h2>
      
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
        <div className="text-sm text-gray-400 mt-2 space-y-1">
          {tutor.bio && (
            <p className="truncate" title={tutor.bio}>
              <strong className="text-gray-300">Bio:</strong> {tutor.bio.substring(0, 80)}{tutor.bio.length > 80 ? '...' : ''}
            </p>
          )}
          {tutor.experience && (
            <p>
              <strong className="text-gray-300">Experience:</strong> {tutor.experience}
            </p>
          )}
          {tutor.hourlyRate !== undefined && (
            <p>
              <strong className="text-gray-300">Rate:</strong> ${tutor.hourlyRate}/hr
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <h3 className="text-md font-semibold text-white mb-1">Skills:</h3>
          {tutor.skills.length === 0 ? (
            <p className="text-xs text-gray-500">No skills listed.</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {tutor.skills.map((userSkill) => (
                <span key={userSkill.userSkillID} className="bg-gray-750 text-blue-300 px-2 py-0.5 rounded-full text-xs">
                  {userSkill.skill.skillName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-4 pt-2 border-t border-gray-700">
        <Link to={`/tutors/${tutor.userID}`} className="text-blue-400 hover:text-blue-300 hover:underline font-medium">
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default TutorCard;
