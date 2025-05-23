import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@/types/user.types';
import type { TutorProfileDto } from '@/types/TutorProfile';
import type { UserSkill } from '@/types/skill.types';
import { TutorProfileService } from '@/services/TutorProfileService';
import { UserSkillService } from '@/services/UserSkillService';

interface TutorCardProps {
  tutor: User;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const [tutorBio, setTutorBio] = useState<TutorProfileDto | null>(null);
  const [bioLoading, setBioLoading] = useState<boolean>(true);
  const [bioError, setBioError] = useState<string | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState<boolean>(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBio = async () => {
      if (!tutor.userID) return;
      setBioLoading(true);
      setBioError(null);
      try {
        const result = await TutorProfileService.getTutorProfileByUserId(tutor.userID);
        if (result.success && result.data) {
          setTutorBio(result.data);
        } else if (result.isNotFoundError) {
          setBioError('Tutor bio not found.');
          setTutorBio(null);
        } else {
          if (result.error instanceof Error) { setBioError(result.error.message); } else if (typeof result.error === 'string') { setBioError(result.error); } else { setBioError('Failed to fetch bio.'); }
          setTutorBio(null);
        }
      } catch (err) {
        console.error('Error fetching tutor bio:', err);
        setBioError('An unexpected error occurred while fetching bio.');
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

    fetchBio();
    fetchSkills();
  }, [tutor.userID]);

  return (
    <div className="border p-4 rounded-lg shadow hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
      <img
        src={tutor.avatarUrl || '/default-avatar.png'}
        alt={tutor.fullName}
        className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
      />
      <h2 className="text-xl font-semibold text-center mb-2 text-gray-800">{tutor.fullName}</h2>

      <div className="flex-grow">
        {bioLoading && <p className="text-sm text-gray-500 text-center py-2">Loading bio...</p>}
        {bioError && !tutorBio && <p className="text-sm text-red-500 text-center py-2">{bioError}</p>}
        
        {tutorBio && (
          <div className="text-sm text-gray-700 mt-2 space-y-1">
            {tutorBio.bio && (
              <p className="truncate" title={tutorBio.bio}>
                <strong>Bio:</strong> {tutorBio.bio.substring(0, 80)}{tutorBio.bio.length > 80 ? '...' : ''}
              </p>
            )}
            {tutorBio.experience && (
              <p>
                <strong>Experience:</strong> {tutorBio.experience}
              </p>
            )}
            {tutorBio.hourlyRate !== undefined && (
              <p>
                <strong>Rate:</strong> ${tutorBio.hourlyRate}/hr
              </p>
            )}
          </div>
        )}
        {!bioLoading && !tutorBio && !bioError && (
           <p className="text-sm text-gray-500 text-center mt-2 py-2">No additional bio information available.</p>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100">
          <h3 className="text-md font-semibold text-gray-700 mb-1">Skills:</h3>
          {skillsLoading && <p className="text-xs text-gray-500">Loading skills...</p>}
          {skillsError && <p className="text-xs text-red-500">{skillsError}</p>}
          {!skillsLoading && !skillsError && skills.length === 0 && (
            <p className="text-xs text-gray-500">No skills listed.</p>
          )}
          {!skillsLoading && !skillsError && skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {skills.map((userSkill) => (
                <span key={userSkill.userSkillID} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {userSkill.skill.skillName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-4 pt-2 border-t border-gray-200">
        <Link to={`/tutors/${tutor.userID}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default TutorCard;
