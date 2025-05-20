export interface Skill {
  skillID: string;
  name: string;
  description?: string;
  skillLevel?: SkillLevel; 
}

export interface CreateSkillDto {
  skillName: string; 
  description?: string;
  skillLevel: SkillLevel;
}

export interface UpdateSkillDto {
  skillName?: string; 
  description?: string;
  skillLevel?: SkillLevel; 
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
