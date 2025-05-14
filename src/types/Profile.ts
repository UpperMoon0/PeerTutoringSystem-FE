export interface ProfileDto { 
  userID: string;
  fullName: string;
  email: string;
  dateOfBirth: string; 
  phoneNumber: string; 
  gender: string; 
  hometown: string; 
  avatarUrl?: string; 
  status: string; 
  role: string; 
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
