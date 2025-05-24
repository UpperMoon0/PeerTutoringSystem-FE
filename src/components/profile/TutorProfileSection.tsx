import React, { useState, useEffect, useCallback } from 'react';
import { TutorProfileService } from '../../services/TutorProfileService';
import type { TutorProfileDto, CreateTutorProfileDto, UpdateTutorProfileDto as UpdateTutorDtoInternal } from '../../types/TutorProfile';
import { UserSkillService } from '../../services/UserSkillService';
import TutorProfileDisplay from './TutorProfileDisplay';
import TutorProfileForm from './TutorProfileForm';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PlusCircle } from 'lucide-react';
import type { AppUser } from '../../contexts/AuthContext';
import type { ProfileDto } from '@/types/user.types';

interface TutorProfileSectionProps {
  userId: string;
  currentUser: AppUser | null;
  profile: ProfileDto;
}

const TutorProfileSection: React.FC<TutorProfileSectionProps> = ({ userId, currentUser, profile }) => {
  const [tutorProfile, setTutorProfile] = useState<TutorProfileDto | null>(null);
  const [isEditingTutorProfile, setIsEditingTutorProfile] = useState(false);
  const [tutorProfileLoading, setTutorProfileLoading] = useState(false);
  const [tutorProfileError, setTutorProfileError] = useState<string | null>(null);

  const fetchTutorProfileData = useCallback(async (currentUserId: string) => {
    setTutorProfileLoading(true);
    setTutorProfileError(null);
    let fetchedTutorProfile: TutorProfileDto | null = null;
    try {
      const tutorResult = await TutorProfileService.getTutorProfileByUserId(currentUserId);
      if (tutorResult.success && tutorResult.data) {
        fetchedTutorProfile = tutorResult.data;
        const skillsResult = await UserSkillService.getUserSkills(currentUserId);
        if (skillsResult.success && skillsResult.data) {
          fetchedTutorProfile = { ...fetchedTutorProfile, skills: skillsResult.data };
        } else {
          console.warn(`Failed to fetch skills for tutor ${currentUserId}:`, skillsResult.error);
          fetchedTutorProfile = { ...fetchedTutorProfile, skills: [] };
        }
        setTutorProfile(fetchedTutorProfile);
      } else if (tutorResult.isNotFoundError) {
        setTutorProfile(null);
      } else {
        const errorMessage = tutorResult.error instanceof Error ? tutorResult.error.message : typeof tutorResult.error === 'string' ? tutorResult.error : (tutorResult.error && typeof tutorResult.error.message === 'string') ? tutorResult.error.message : 'Failed to fetch tutor profile.';
        setTutorProfileError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching tutor profile data.';
      setTutorProfileError(errorMessage);
    }
    setTutorProfileLoading(false);
  }, [setTutorProfile, setTutorProfileError, setTutorProfileLoading]);

  useEffect(() => {
    if (profile.role === 'Tutor' && currentUser?.userId === profile.userID && userId) {
      fetchTutorProfileData(userId);
    } else {
      setTutorProfile(null);
      setTutorProfileLoading(false);
      setTutorProfileError(null);
      setIsEditingTutorProfile(false);
    }
  }, [userId, currentUser, profile, fetchTutorProfileData]);

  const handleCreateTutorProfile = () => {
    setIsEditingTutorProfile(true);
    setTutorProfile(null);
  };

  const handleEditTutorProfile = () => {
    setIsEditingTutorProfile(true);
  };

  const handleCancelTutorProfileEdit = useCallback(() => {
    setIsEditingTutorProfile(false);
    if (profile.role === 'Tutor' && userId) {
        fetchTutorProfileData(userId);
    }
  }, [profile, userId, fetchTutorProfileData, setIsEditingTutorProfile]);

  const handleSaveTutorProfile = useCallback(async (data: CreateTutorProfileDto | UpdateTutorDtoInternal) => {
    if (!userId) {
      setTutorProfileError("User ID is missing.");
      return;
    }
    setTutorProfileLoading(true);
    setTutorProfileError(null);
    const { skillIds, ...profileData } = data;
    try {
      let profileResult;
      if (tutorProfile && tutorProfile.bioID) {
        profileResult = await TutorProfileService.updateTutorProfile(tutorProfile.bioID, profileData as UpdateTutorDtoInternal);
      } else {
        profileResult = await TutorProfileService.createTutorProfile({ ...profileData, userID: userId } as CreateTutorProfileDto);      }

      if (profileResult.success && profileResult.data) {
        const newBioId = profileResult.data.bioID;
        const currentSkillsResult = await UserSkillService.getUserSkills(userId);
        const newSkillIds = skillIds || [];
        if (currentSkillsResult.success && currentSkillsResult.data) {
          const currentSkills = currentSkillsResult.data;
          const currentSkillIds = currentSkills.map(us => us.skill.skillID);
          const skillsToDelete = currentSkills.filter(us => !newSkillIds.includes(us.skill.skillID));
          for (const userSkillToDelete of skillsToDelete) {
            if (userSkillToDelete.userSkillID) {
              await UserSkillService.deleteUserSkill(userSkillToDelete.userSkillID);
            }
          }
          const skillsToAdd = newSkillIds.filter(id => !currentSkillIds.includes(id));
          for (const skillIdToAdd of skillsToAdd) {
            const addResult = await UserSkillService.addUserSkill({ userID: userId, skillID: skillIdToAdd, isTutor: true });
            if (!addResult.success) {
              console.error("Failed to add skill:", skillIdToAdd, addResult.error);
            }
          }
        } else {
          for (const skillIdToAdd of newSkillIds) {
            const addResult = await UserSkillService.addUserSkill({ userID: userId, skillID: skillIdToAdd, isTutor: true });
            if (!addResult.success) {
              console.error("Failed to add skill:", skillIdToAdd, addResult.error);
            }
          }
        }
        if (userId) {
          await fetchTutorProfileData(userId);
        }
        setIsEditingTutorProfile(false);
      } else {
        setTutorProfileError(profileResult.error instanceof Error ? profileResult.error.message : typeof profileResult.error === 'string' ? profileResult.error : (profileResult.error && typeof profileResult.error.message === 'string') ? profileResult.error.message : 'Failed to save tutor profile.');
      }
    } catch (err) {
      setTutorProfileError(err instanceof Error ? err.message : 'An unknown error occurred while saving tutor profile.');
    }
    setTutorProfileLoading(false);
  }, [userId, tutorProfile, fetchTutorProfileData, setIsEditingTutorProfile, setTutorProfileError, setTutorProfileLoading]);

  // This section is only rendered if profile.role is Tutor and current user is the owner.
  // This is ensured by the calling component (UserProfileCard), but good to keep in mind.

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Tutor Bio</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditingTutorProfile ? (
          <TutorProfileForm
            initialData={tutorProfile}
            onSubmit={handleSaveTutorProfile}
            onCancel={handleCancelTutorProfileEdit}
            isLoading={tutorProfileLoading}
          />
        ) : tutorProfileLoading ? (
          <p>Loading tutor bio...</p>
        ) : tutorProfile ? (
          <TutorProfileDisplay
            tutorProfile={tutorProfile}
            onEdit={handleEditTutorProfile}
            canEdit={true} // This section is only for the owner tutor
          />
        ) : tutorProfileError ? (
          <p className="text-red-500">Error: {tutorProfileError}</p>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              You don't have a bio yet. Please create one to attract students.
            </p>
            <Button onClick={handleCreateTutorProfile}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Bio
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TutorProfileSection;