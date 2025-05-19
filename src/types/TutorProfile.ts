import type { UserSkill } from './skill.types'; 

export interface TutorProfileDto {
  bioID: number; 
  userID: string;
  tutorName: string;
  bio: string;
  experience: string; 
  availability: string;
  hourlyRate: number;
  avatarUrl: string;
  school?: string; 
  createdDate: string; 
  updatedDate?: string;
  skills?: UserSkill[]; 
}

export interface CreateTutorProfileDto {
  bio: string;
  experience: string; 
  availability: string;
  hourlyRate: number;
  skillIds?: string[]; 
}

export interface UpdateTutorProfileDto extends CreateTutorProfileDto {}
