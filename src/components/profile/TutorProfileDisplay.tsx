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
    <div className="mt-8 p-6 bg-card text-card-foreground rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Tutor Profile</h2>
        {canEdit && <Button onClick={onEdit}>Edit Tutor Profile</Button>}
      </div>
      <div>
        <p className="mb-2"><strong className="font-medium">Bio:</strong> {tutorProfile.bio}</p>
        <p className="mb-2"><strong className="font-medium">Experience:</strong> {tutorProfile.experience}</p>
        <p className="mb-2"><strong className="font-medium">Availability:</strong> {tutorProfile.availability}</p>
        <p><strong className="font-medium">Hourly Rate:</strong> {typeof tutorProfile.hourlyRate === 'number' ? `$${tutorProfile.hourlyRate.toFixed(2)}` : 'N/A'}</p>
        {tutorProfile.skills && tutorProfile.skills.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Skills:</h3>
            <ul className="list-disc list-inside ml-4">
              {tutorProfile.skills.map((userSkill) => (
                <li key={userSkill.userSkillID}>
                  {userSkill.skill.skillName} - Level: {userSkill.skill.skillLevel}
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
