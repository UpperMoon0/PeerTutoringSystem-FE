import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@/types/user.types';
import type { TutorProfileDto } from '@/types/TutorProfile';
import type { UserSkill } from '@/types/skill.types';
import { TutorProfileService } from '@/services/TutorProfileService';
import { UserSkillService } from '@/services/UserSkillService';
import { ReviewService } from '@/services/ReviewService';
import StarRating from '@/components/ui/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TutorCardProps {
  tutor: User;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const [tutorBio, setTutorBio] = useState<TutorProfileDto | null>(null);
  const [bioLoading, setBioLoading] = useState<boolean>(true);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState<boolean>(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [rating, setRating] = useState<{ averageRating: number; reviewCount: number }>({ averageRating: 0, reviewCount: 0 });
  const [ratingLoading, setRatingLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBio = async () => {
      if (!tutor.userID) return;
      setBioLoading(true);
      try {
        const result = await TutorProfileService.getTutorProfileByUserId(tutor.userID);
        if (result.success && result.data) {
          setTutorBio(result.data);
        } else if (result.isNotFoundError) {
          setTutorBio(null);
        } else {
          setTutorBio(null);
        }
      } catch (err) {
        console.log('Error fetching tutor bio (expected for pre-filtered tutors):', err);
        setTutorBio(null);
      } finally {
        setBioLoading(false);
      }
    };

    const fetchSkills = async () => {
      if (!tutor.userID) return;
      setSkillsLoading(true);
      setSkillsError(null);
      try {
        const result = await UserSkillService.getUserSkills(tutor.userID);
        if (result.success && result.data) {
          setSkills(result.data);
        } else {
          if (result.error instanceof Error) { setSkillsError(result.error.message); } else if (typeof result.error === 'string') { setSkillsError(result.error); } else { setSkillsError('Failed to fetch skills.'); }
        }
      } catch (err) {
        console.error('Error fetching tutor skills:', err);
        setSkillsError('An unexpected error occurred while fetching skills.');
      } finally {
        setSkillsLoading(false);
      }
    };

    const fetchRating = async () => {
      if (!tutor.userID) return;
      setRatingLoading(true);
      try {
        const [avgRatingResult, reviewsResult] = await Promise.all([
          ReviewService.getAverageRatingByTutorId(tutor.userID),
          ReviewService.getReviewsByTutorId(tutor.userID)
        ]);

        const averageRating = avgRatingResult.success && avgRatingResult.data ? avgRatingResult.data.averageRating : 0;
        const reviewCount = reviewsResult.success && reviewsResult.data ? reviewsResult.data.length : 0;
        
        setRating({ averageRating, reviewCount });
      } catch (err) {
        console.log('Error fetching tutor rating:', err);
        setRating({ averageRating: 0, reviewCount: 0 });
      } finally {
        setRatingLoading(false);
      }
    };

    fetchBio();
    fetchSkills();
    fetchRating();
  }, [tutor.userID]);

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
        {ratingLoading ? (
          <p className="text-xs text-gray-400">Loading rating...</p>
        ) : (
          <StarRating
            rating={rating.averageRating}
            reviewCount={rating.reviewCount}
            size="sm"
            className="justify-center"
          />
        )}
      </div>

      <div className="flex-grow">
        {bioLoading && <p className="text-sm text-gray-400 text-center py-2">Loading bio...</p>}
        
        {tutorBio && (
          <div className="text-sm text-gray-400 mt-2 space-y-1">
            {tutorBio.bio && (
              <p className="truncate" title={tutorBio.bio}>
                <strong className="text-gray-300">Bio:</strong> {tutorBio.bio.substring(0, 80)}{tutorBio.bio.length > 80 ? '...' : ''}
              </p>
            )}
            {tutorBio.experience && (
              <p>
                <strong className="text-gray-300">Experience:</strong> {tutorBio.experience}
              </p>
            )}
            {tutorBio.hourlyRate !== undefined && (
              <p>
                <strong className="text-gray-300">Rate:</strong> ${tutorBio.hourlyRate}/hr
              </p>
            )}
          </div>
        )}
        {!bioLoading && !tutorBio && (
           <p className="text-sm text-gray-500 text-center mt-2 py-2">Loading tutor information...</p>
        )}

        <div className="mt-3 pt-3 border-t border-gray-700">
          <h3 className="text-md font-semibold text-white mb-1">Skills:</h3>
          {skillsLoading && <p className="text-xs text-gray-400">Loading skills...</p>}
          {skillsError && <p className="text-xs text-red-400">{skillsError}</p>}
          {!skillsLoading && !skillsError && skills.length === 0 && (
            <p className="text-xs text-gray-500">No skills listed.</p>
          )}
          {!skillsLoading && !skillsError && skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {skills.map((userSkill) => (
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
