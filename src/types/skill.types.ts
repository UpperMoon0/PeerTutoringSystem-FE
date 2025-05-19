export interface Skill {
  skillID: string;
  name: string;
  description?: string; 
}

export interface CreateSkillDto {
  name: string;
  description?: string;
}

export interface UpdateSkillDto {
  name?: string; 
  description?: string;
}
