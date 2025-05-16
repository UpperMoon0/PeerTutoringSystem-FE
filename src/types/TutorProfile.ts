export interface TutorProfileDto {
  profileId: number;
  userID: string;
  bio: string;
  yearsOfExperience: number;
  subjectsOffered: string[]; 
  availability: string; 
  hourlyRate: number;
}

export interface CreateTutorProfileDto {
  bio: string;
  yearsOfExperience: number;
  subjectsOffered: string[];
  availability: string;
  hourlyRate: number;
}

export interface UpdateTutorProfileDto extends CreateTutorProfileDto {}
