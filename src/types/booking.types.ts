import type { AuthResponse } from './auth.types';

export interface Booking {
  bookingId: string;
  studentId: string;
  tutorId: string;
  availabilityId: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Confirmed' | 'CancelledByStudent' | 'CancelledByTutor' | 'Completed' | 'Missed';
  createdAt: string;
  updatedAt: string;
  student?: AuthResponse;
  tutor?: AuthResponse;
}

export interface CreateBookingDto {
  tutorId: string;
  studentId: string;
  availabilityId: string;
  startTime: string;
  endTime: string;
}

export interface UpdateBookingStatusDto {
  status: 'Pending' | 'Confirmed' | 'CancelledByStudent' | 'CancelledByTutor' | 'Completed' | 'Missed';
  reason?: string;
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
