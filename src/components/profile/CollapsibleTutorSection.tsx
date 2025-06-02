import React, { useState, useEffect, useCallback } from 'react';
import { TutorProfileService } from '../../services/TutorProfileService';
import type { TutorProfileDto, CreateTutorProfileDto, UpdateTutorProfileDto as UpdateTutorDtoInternal } from '../../types/TutorProfile';
import { UserSkillService } from '../../services/UserSkillService';
import TutorProfileDisplay from './TutorProfileDisplay';
import TutorProfileForm from './TutorProfileForm';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  PlusCircle, 
  ChevronDown, 
  ChevronUp, 
  GraduationCap,
  DollarSign,
  Clock,
  Star
} from 'lucide-react';
import type { AppUser } from '../../contexts/AuthContext';
import type { ProfileDto } from '@/types/user.types';

interface CollapsibleTutorSectionProps {
  userId: string;
  currentUser: AppUser | null;
  profile: ProfileDto;
  isExpanded: boolean;
  onToggleExpanded: (expanded: boolean) => void;
}

const CollapsibleTutorSection: React.FC<CollapsibleTutorSectionProps> = ({ 
  userId, 
  currentUser, 
  profile,
  isExpanded,
  onToggleExpanded
}) => {
  const [tutorProfile, setTutorProfile] = useState<TutorProfileDto | null>(null);
  const [isEditingTutorProfile, setIsEditingTutorProfile] = useState(false);
  const [tutorProfileLoading, setTutorProfileLoading] = useState(false);

  const fetchTutorProfileData = useCallback(async (currentUserId: string) => {
    setTutorProfileLoading(true);
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
        console.error('Failed to fetch tutor profile:', tutorResult.error);
        setTutorProfile(null);
      }
    } catch (err) {
      console.error('An unknown error occurred while fetching tutor profile data:', err);
      setTutorProfile(null);
    }
    setTutorProfileLoading(false);
  }, []);

  useEffect(() => {
    if (profile.role === 'Tutor' && currentUser?.userId === profile.userID && userId) {
      fetchTutorProfileData(userId);
    } else {
      setTutorProfile(null);
      setTutorProfileLoading(false);
      setIsEditingTutorProfile(false);
    }
  }, [userId, currentUser, profile, fetchTutorProfileData]);

  const handleCreateTutorProfile = () => {
    setIsEditingTutorProfile(true);
    setTutorProfile(null);
    if (!isExpanded) {
      onToggleExpanded(true);
    }
  };

  const handleEditTutorProfile = () => {
    setIsEditingTutorProfile(true);
    if (!isExpanded) {
      onToggleExpanded(true);
    }
  };

  const handleCancelTutorProfileEdit = useCallback(() => {
    setIsEditingTutorProfile(false);
    if (profile.role === 'Tutor' && userId) {
      fetchTutorProfileData(userId);
    }
  }, [profile, userId, fetchTutorProfileData]);

  const handleSaveTutorProfile = useCallback(async (data: CreateTutorProfileDto | UpdateTutorDtoInternal) => {
    if (!userId) {
      console.error("User ID is missing.");
      return;
    }
    setTutorProfileLoading(true);
    const { skillIds, ...profileData } = data;
    try {
      let profileResult;
      if (tutorProfile && tutorProfile.bioID) {
        profileResult = await TutorProfileService.updateTutorProfile(tutorProfile.bioID, profileData as UpdateTutorDtoInternal);
      } else {
        profileResult = await TutorProfileService.createTutorProfile(profileData as CreateTutorProfileDto);
      }

      if (profileResult.success && profileResult.data) {
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
        console.error('Failed to save tutor profile:', profileResult.error);
      }
    } catch (err) {
      console.error('An unknown error occurred while saving tutor profile:', err);
    }
    setTutorProfileLoading(false);
  }, [userId, tutorProfile, fetchTutorProfileData]);

  const tutorSummary = tutorProfile ? {
    rate: tutorProfile.hourlyRate,
    skillCount: tutorProfile.skills?.length || 0,
    availability: tutorProfile.availability
  } : null;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader
        className="cursor-pointer hover:bg-gray-800 transition-colors border-b border-gray-800"
        onClick={() => onToggleExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 bg-opacity-20 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                Tutor Profile
              </CardTitle>
              {!isExpanded && tutorSummary && (
                <div className="flex items-center gap-4 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ${tutorSummary.rate}/hr
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {tutorSummary.skillCount} skills
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {tutorSummary.availability}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tutorProfile && !isEditingTutorProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTutorProfile();
                }}
              >
                Edit
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <CardContent className="pt-6">
          {isEditingTutorProfile ? (
            <TutorProfileForm
              initialData={tutorProfile}
              onSubmit={handleSaveTutorProfile}
              onCancel={handleCancelTutorProfileEdit}
              isLoading={tutorProfileLoading}
            />
          ) : tutorProfileLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-3 text-muted-foreground">Loading tutor profile...</p>
            </div>
          ) : tutorProfile ? (
            <TutorProfileDisplay
              tutorProfile={tutorProfile}
              onEdit={handleEditTutorProfile}
              canEdit={true}
            />
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Create Your Tutor Profile</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Stand out to students by creating a compelling tutor profile that showcases your expertise and experience.
                </p>
              </div>
              <Button
                onClick={handleCreateTutorProfile}
                size="lg"
                className="mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Create Profile
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default CollapsibleTutorSection;