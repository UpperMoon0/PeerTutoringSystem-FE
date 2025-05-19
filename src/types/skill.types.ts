export interface Skill {
  skillID: string;
  name: string;
  description?: string;
  skillLevel?: string; 
}

export interface CreateSkillDto {
  skillName: string; 
  description?: string;
  skillLevel: string;
}

export interface UpdateSkillDto {
  skillName?: string; 
  description?: string;
  skillLevel?: string; 
}
