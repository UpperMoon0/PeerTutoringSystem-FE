import type { AuthResponse } from './auth.types';
import type { Session } from './session.types';

export interface Booking {
  bookingId: string;
  studentId: string;
  tutorId: string;
  availabilityId?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';
  paymentStatus: 'Unpaid' | 'Paid';
  createdAt: string;
  updatedAt?: string;
  studentName?: string;
  tutorName?: string;
  basePrice?: number;
  serviceFee?: number;
  totalPrice?: number;
  topic: string;
  description: string;
  skillId?: string;
  student?: AuthResponse;
  tutor?: AuthResponse;
  session?: Session;
  proofOfPaymentImageUrl?: string;
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
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';
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

export interface StudentBookingHistoryParams {
  page?: number;
  pageSize?: number;
  status?: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected' | null;
  skillId?: string;
  startDate?: string; // ISO string for query
  endDate?: string;   // ISO string for query
}
