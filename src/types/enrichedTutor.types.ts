import type { UserSkill } from './skill.types';

export interface EnrichedTutor {
  userID: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio: string;
  experience: string;
  hourlyRate: number;
  availability: string;
  school?: string;
  averageRating: number;
  reviewCount: number;
  skills: UserSkill[];
}