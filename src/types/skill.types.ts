export interface Skill {
  skillID: string;
  skillName: string;
  description: string; // Changed from Description?: string
  skillLevel: SkillLevel; // Changed from SkillLevel?: SkillLevel
}
export interface CreateSkillDto {
  skillName: string;
  description: string; // Changed from description?: string
  skillLevel: SkillLevel;
}

export interface UpdateSkillDto {
  skillID: string; // Added to match BE SkillDto for PUT body
  skillName: string; // Changed from skillName?: string
  description: string; // Changed from description?: string
  skillLevel: SkillLevel; // Changed from skillLevel?: SkillLevel
}

export type SkillLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' | 'Expert';

export interface UserSkillDto {
  userID: string;
  skillID: string;
  isTutor: boolean;
}

export interface UserSkill extends UserSkillDto {
  userSkillID: string;
  skill: Skill;
}
