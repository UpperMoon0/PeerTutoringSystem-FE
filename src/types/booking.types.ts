import type { AuthResponse } from './auth.types';

export interface Booking {
  bookingId: string;
  studentId: string;
  tutorId: string;
  availabilityId: string; 
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'; 
  createdAt: string;
  updatedAt?: string; 
  studentName?: string; 
  tutorName?: string; 
  topic: string; 
  description: string; 
  skillId?: string; 
  student?: AuthResponse;
  tutor?: AuthResponse;
}

export interface CreateBookingDto {
  tutorId: string;
  studentId: string; 
  availabilityId: string;
  startTime: string; 
  endTime: string; 
  topic: string; 
  description: string;
  skillId?: string; 
}

export interface UpdateBookingStatusDto {
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
}

export interface BookingListResponse {
  data: Booking[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface BookingResponse {
    data: Booking;
    message?: string;
}
