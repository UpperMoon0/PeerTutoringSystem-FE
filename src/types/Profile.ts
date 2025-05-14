export interface ProfileDto {
  profileID: number;
  userID: string;
  tutorName: string; 
  bio: string;
  experience: string;
  hourlyRate: number;
  availability: string;
  avatarUrl: string; 
  school?: string;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateProfileDto {
  hourlyRate: number;
  bio?: string;
  experience?: string;
  availability?: string;
}

export interface UpdateProfileDto {
  hourlyRate: number;
  bio?: string;
  experience?: string;
  availability?: string;
}
