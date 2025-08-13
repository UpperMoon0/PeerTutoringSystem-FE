import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a consistent gradient color based on the tutor's name
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