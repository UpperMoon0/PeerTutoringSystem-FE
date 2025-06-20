export interface User {
  userID: string;
  fullName: string;
  email: string;
  dateOfBirth: string; 
  phoneNumber: string;
  gender: string;
  hometown: string;
  school?: string;
  avatarUrl?: string;
  status: string;
  role: string;
}

export interface ProfileDto {
  bioID: number;
  userID: string;
  tutorName: string;
  bio?: string;
  experience?: string;
  hourlyRate?: number;
  availability?: string;
  avatarUrl?: string;
  school?: string;
  createdDate: string;
  updatedDate?: string;
}

export interface UpdateProfileDto { 
  fullName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  gender: string;
  hometown: string;
  avatar?: File | null; 
}
