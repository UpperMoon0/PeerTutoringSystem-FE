export interface Skill {
  skillID: string;
  skillName: string;
  description: string; 
  skillLevel: SkillLevel; 
}
export interface CreateSkillDto {
  skillName: string;
  description: string; 
  skillLevel: SkillLevel;
}

export interface UpdateSkillDto {
  skillID: string; 
  skillName: string; 
  description: string; 
  skillLevel: SkillLevel; 
}

export type SkillLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' | 'Expert';

export interface UserSkillDto {
  userSkillID?: string;
  userID: string;
  isTutor: boolean;
}

export interface UserSkill extends UserSkillDto {
  userSkillID: string;
  skill: Skill;
}
