import React from 'react';
import type { TutorProfileDto } from '../../types/TutorProfile';
import { Button } from '../ui/button'; 

interface TutorProfileDisplayProps {
  tutorProfile: TutorProfileDto;
  onEdit: () => void;
  canEdit: boolean;
}

const TutorProfileDisplay: React.FC<TutorProfileDisplayProps> = ({ tutorProfile, onEdit, canEdit }) => {
  return (
    <div className="mt-6 p-6 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
        <h2 className="text-2xl font-semibold text-white">Tutor Profile</h2>
        {canEdit &&
          <Button
            onClick={onEdit}
            className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
          >Edit Tutor Profile</Button>
        }
      </div>
      <div className="space-y-3 text-gray-300">
        <p><strong className="font-medium text-white">Bio:</strong> {tutorProfile.bio}</p>
        <p><strong className="font-medium text-white">Experience:</strong> {tutorProfile.experience}</p>
        <p><strong className="font-medium text-white">Availability:</strong> {tutorProfile.availability}</p>
        <p><strong className="font-medium text-white">Hourly Rate:</strong> {typeof tutorProfile.hourlyRate === 'number' ? `$${tutorProfile.hourlyRate.toFixed(2)}` : 'N/A'}</p>
        {tutorProfile.skills && tutorProfile.skills.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Skills:</h3>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-400">
              {tutorProfile.skills.map((userSkill) => (
                <li key={userSkill.userSkillID} className="text-gray-300">
                  <span className="text-blue-400">{userSkill.skill.skillName}</span> - Level: {userSkill.skill.skillLevel}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorProfileDisplay;
