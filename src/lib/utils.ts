import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a consistent gradient color based on the tutor's name
export const generateGradient = (name: string) => {
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
  return name.charAt(0).toUpperCase();
};
