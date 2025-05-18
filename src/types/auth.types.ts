export interface AuthResponse {
  userID: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
  avatarUrl?: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string; 
  phoneNumber: string;
  gender: string;
  hometown: string;
}

export interface GoogleLoginPayload {
  idToken: string;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  gender: string;
  hometown: string;
}
