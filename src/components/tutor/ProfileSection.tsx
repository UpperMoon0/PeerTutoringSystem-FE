import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TutorProfileDisplay from '@/components/profile/TutorProfileDisplay';
import TutorProfileForm from '@/components/profile/TutorProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import type { TutorProfileDto, CreateTutorProfileDto, UpdateTutorProfileDto } from '@/types/TutorProfile';
import { TutorProfileService } from '@/services/TutorProfileService';
import { UserSkillService } from '@/services/UserSkillService';
import {
  Briefcase,
  Edit,
  PlusCircle,
  Loader2,
  MessageCircle
} from 'lucide-react';

interface ProfileSectionProps {
  onBioStatusChange?: () => Promise<void>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ onBioStatusChange }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tutorDisplayProfile, setTutorDisplayProfile] = useState<TutorProfileDto | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorDisplayProfileData = async () => {
      if (currentUser?.userId) {
        setLoading(true);
        // Use suppressErrors=true to avoid console errors for missing bio
        const result = await TutorProfileService.getTutorProfileByUserId(currentUser.userId, true);
        if (result.success && result.data) {
          // Fetch skills separately and merge
          const skillsResult = await UserSkillService.getUserSkills(currentUser.userId);
          if (skillsResult.success && skillsResult.data) {
            setTutorDisplayProfile({ ...result.data, skills: skillsResult.data });
          } else {
            console.warn(`Failed to fetch skills for tutor ${currentUser.userId}:`, skillsResult.error);
            setTutorDisplayProfile({ ...result.data, skills: [] }); // Set skills to empty array on error
          }
        } else {
          // Silently handle missing bio - this is normal for new tutors
          setTutorDisplayProfile(null);
        }
        setLoading(false);
      }
    };

    fetchTutorDisplayProfileData();
  }, [currentUser]);

  const handleEditProfile = () => setIsEditingProfile(true);
  
  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    // Optionally re-fetch to discard any optimistic updates or ensure data consistency
    if (currentUser?.userId) {
      const fetchTutorDisplayProfileData = async () => {
        if (currentUser?.userId) {
          setLoading(true);
          // Use suppressErrors=true to avoid console errors for missing bio
          const result = await TutorProfileService.getTutorProfileByUserId(currentUser.userId, true);
          if (result.success && result.data) {
            const skillsResult = await UserSkillService.getUserSkills(currentUser.userId);
            if (skillsResult.success && skillsResult.data) {
              setTutorDisplayProfile({ ...result.data, skills: skillsResult.data });
            } else {
              setTutorDisplayProfile({ ...result.data, skills: [] });
            }
          } else {
            setTutorDisplayProfile(null);
          }
          setLoading(false);
        }
      };
      fetchTutorDisplayProfileData();
    }
  };

  const handleSaveProfile = async (data: CreateTutorProfileDto | UpdateTutorProfileDto) => {
    if (!currentUser?.userId) {
      console.error("User ID is missing.");
      return;
    }
    setIsSavingProfile(true);
    const { skillIds, ...profileData } = data;

    try {
      let profileResult;
      if (tutorDisplayProfile && tutorDisplayProfile.bioID) { // Existing profile
        profileResult = await TutorProfileService.updateTutorProfile(tutorDisplayProfile.bioID, profileData as UpdateTutorProfileDto);
      } else { // New profile
        profileResult = await TutorProfileService.createTutorProfile(profileData as CreateTutorProfileDto);
      }

      if (profileResult.success && profileResult.data) {
        // Manage skills
        const currentSkillsResult = await UserSkillService.getUserSkills(currentUser.userId);
        const newSkillIds = skillIds || [];

        if (currentSkillsResult.success && currentSkillsResult.data) {
          const currentSkills = currentSkillsResult.data;
          const currentSkillIdsOnRecord = currentSkills.map(us => us.skill.skillID);

          // Skills to delete
          const skillsToDelete = currentSkills.filter(us => !newSkillIds.includes(us.skill.skillID));
          for (const userSkillToDelete of skillsToDelete) {
            if (userSkillToDelete.userSkillID) {
              await UserSkillService.deleteUserSkill(userSkillToDelete.userSkillID);
            }
          }

          // Skills to add
          const skillsToAdd = newSkillIds.filter(id => !currentSkillIdsOnRecord.includes(id));
          for (const skillIdToAdd of skillsToAdd) {
            await UserSkillService.addUserSkill({ userID: currentUser.userId, skillID: skillIdToAdd, isTutor: true });
          }
        } else { // No existing skills, add all new ones
          for (const skillIdToAdd of newSkillIds) {
            await UserSkillService.addUserSkill({ userID: currentUser.userId, skillID: skillIdToAdd, isTutor: true });
          }
        }

        // Re-fetch profile data to show updated info
        const fetchTutorDisplayProfileData = async () => {
          if (currentUser?.userId) {
            setLoading(true);
            // Use suppressErrors=true to avoid console errors for missing bio
            const result = await TutorProfileService.getTutorProfileByUserId(currentUser.userId, true);
            if (result.success && result.data) {
              const skillsResult = await UserSkillService.getUserSkills(currentUser.userId);
              if (skillsResult.success && skillsResult.data) {
                setTutorDisplayProfile({ ...result.data, skills: skillsResult.data });
              } else {
                setTutorDisplayProfile({ ...result.data, skills: [] });
              }
            } else {
              setTutorDisplayProfile(null);
            }
            setLoading(false);
          }
        };
        await fetchTutorDisplayProfileData(); // Re-fetch without global loading
        setIsEditingProfile(false);
        
        // Notify parent component that bio status has changed
        if (onBioStatusChange) {
          await onBioStatusChange();
        }
      } else {
        console.error('Failed to save tutor profile:', profileResult.error);
        // Handle error display to user if necessary
      }
    } catch (err) {
      console.error('An unknown error occurred while saving tutor profile:', err);
    }
    setIsSavingProfile(false);
  };

  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to manage your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">Tutor Profile Management</h2>
        <p className="text-muted-foreground">Update your tutor profile and skills to attract more students.</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-primary" />
              Your Tutor Profile
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isEditingProfile ? "Update your details below." : "View and manage your public tutor information."}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditingProfile && (currentUser?.role === 'Student' || currentUser?.role === 'Tutor') && tutorDisplayProfile && (
              <Button
                onClick={() => navigate('/chat', { state: { receiverId: tutorDisplayProfile.userID } })}
                variant="outline"
                size="sm"
                className="bg-primary/90 hover:bg-primary text-primary-foreground"
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </Button>
            )}
            {!isEditingProfile && tutorDisplayProfile && (
              <Button onClick={handleEditProfile} variant="outline" size="sm" className="bg-muted border-border hover:bg-muted text-foreground">
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading && !tutorDisplayProfile && !isEditingProfile ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="ml-3 text-muted-foreground">Loading profile...</p>
            </div>
          ) : isEditingProfile ? (
            <TutorProfileForm
              initialData={tutorDisplayProfile}
              onSubmit={handleSaveProfile}
              onCancel={handleCancelEditProfile}
              isLoading={isSavingProfile}
            />
          ) : tutorDisplayProfile ? (
            <TutorProfileDisplay tutorProfile={tutorDisplayProfile} />
          ) : (
            // Not loading, not editing, and no profile data
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Tutor Profile Not Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                It seems you haven't set up your tutor profile yet. Create one to start attracting students.
              </p>
              <Button onClick={handleEditProfile} size="lg" className="mt-4">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Your Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;
