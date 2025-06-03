export interface CreateReviewDto {
  bookingID: string; // Guid maps to string in TS
  studentID: string; // Guid maps to string in TS
  tutorID: string;   // Guid maps to string in TS
  rating: number;    // int maps to number
  comment?: string;  // string? maps to optional string
  Status: string;    // Added based on backend error
}

export interface ReviewDto {
  reviewID: number;  // int maps to number
  bookingID: string; // Guid maps to string
  studentID: string; // Guid maps to string
  tutorID: string;   // Guid maps to string
  rating: number;    // int maps to number
  comment?: string;  // string? maps to optional string
  reviewDate: string; // DateTime maps to string (ISO 8601)
}