export interface AuthResponse {
  userID: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
  avatarUrl?: string;
  role: string;
}
