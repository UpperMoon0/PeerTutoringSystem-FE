export interface CreateReviewDto {
  bookingId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  comment?: string;
}

export interface ReviewDto {
  reviewID: number;  // int maps to number
  bookingID: string; // Guid maps to string
  studentID: string; // Guid maps to string
  tutorID: string;   // Guid maps to string
  rating: number;    // int maps to number
  comment?: string;  // string? maps to optional string
  reviewDate: string; // DateTime maps to string (ISO 8601)
  studentName: string;
  studentAvatarUrl: string;
}