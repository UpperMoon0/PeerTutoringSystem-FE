import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Booking } from '@/types/booking.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateGradient = (name: string) => {
  if (!name) {
    return 'from-gray-400 to-gray-500';
  }
  const colors = [
    'from-purple-400 to-pink-400',
    'from-blue-400 to-indigo-400',
    'from-green-400 to-teal-400',
    'from-yellow-400 to-orange-400',
    'from-red-400 to-pink-400',
    'from-indigo-400 to-purple-400',
    'from-teal-400 to-blue-400',
    'from-orange-400 to-red-400',
    'from-pink-400 to-purple-400',
    'from-cyan-400 to-blue-400'
  ];
  
  // Generate a hash from the name to pick a consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const getInitials = (name: string) => {
  if (!name) {
    return '?';
  }
  return name.charAt(0).toUpperCase();
};


export const generateBrightColor = (text: string): string => {
  if (!text) {
    return '#CCCCCC'; // Default gray color
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate a color with high saturation and brightness
  const hue = Math.abs(hash) % 360;
  const saturation = 75; // High saturation for a bright color
  const lightness = 60;  // A lightness that avoids being too dark or too washed out

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const getStatusString = (status: Booking['status']): Booking['status'] => {
  const statusMap: { [key: number]: Booking['status'] } = {
    0: 'Pending',
    1: 'Confirmed',
    2: 'Cancelled',
    3: 'Completed',
    4: 'Rejected'
  };
  return typeof status === 'number' ? statusMap[status] : status;
};

export const getStatusBadgeVariant = (status: Booking['status']) => {
  const statusString = getStatusString(status);
  switch (statusString) {
    case 'Pending': return 'pending';
    case 'Confirmed': return 'confirmed';
    case 'Cancelled':
    case 'Rejected': return 'destructive';
    case 'Completed': return 'completed';
    default: return 'secondary';
  }
};

export const getWithdrawStatusString = (status: any): string => {
  const statusMap: { [key: number]: string } = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected',
    3: 'Canceled',
  };
  return typeof status === 'number' ? statusMap[status] : status;
};

export const getWithdrawStatusBadgeVariant = (status: any) => {
  const statusString = getWithdrawStatusString(status);
  switch (statusString) {
    case 'Pending':
      return 'pending';
    case 'Approved':
      return 'confirmed';
    case 'Rejected':
    case 'Canceled':
      return 'destructive';
    default:
      return 'secondary';
  }
};