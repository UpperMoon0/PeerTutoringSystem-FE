import type { Booking } from './booking.types';

export interface TutorDashboardStats {
  totalBookings: number;
  availableSlots: number;
  completedSessions: number;
  totalEarnings: number;
  totalProfit: number;
}

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  description: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface ChartDataPoint {
  month: string;
  earnings: number;
}

export interface TutorFinanceDetails {
  bookings?: Booking[];
  totalProfit?: number;
  totalEarnings?: number;
  monthlyEarnings?: ChartDataPoint[];
  recentTransactions?: Transaction[];
}