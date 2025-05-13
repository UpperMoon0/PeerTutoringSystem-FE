export interface Tutor {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  courses: string; // Comma-separated list of courses
  price: string;
  tutoringInfo: string[];
}
