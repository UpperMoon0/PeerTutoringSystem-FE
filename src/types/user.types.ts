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
  userID: string;
  fullName: string; 
  email: string; // Added email field
  dateOfBirth: string; 
  phoneNumber: string; 
  gender: string; 
  hometown: string; 
  avatarUrl?: string; 
  status: string; 
  role: string; 
  bio?: string; 
  hourlyRate?: number; 
  experience?: string; 
  availability?: string; 
  school?: string; 
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
