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
}

export interface CreateTutorProfileDto {
  bio: string;
  experience: string; // Changed from yearsOfExperience to experience (string)
  availability: string;
  hourlyRate: number;
}

export interface UpdateTutorProfileDto extends CreateTutorProfileDto {}
