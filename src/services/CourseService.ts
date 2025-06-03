import type { Course } from '@/types/Course';

// Re-export Course type for use in other modules
export type { Course };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getFeaturedCourses = async (searchTerm?: string): Promise<Course[]> => {
  console.log(`[Real API] Fetching featured courses. Search term: ${searchTerm}`);
  try {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    const response = await fetch(`${API_BASE_URL}/courses/featured${query}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error ${response.status}: ${response.statusText}`, errorBody);
      throw new Error(`Failed to fetch courses. Status: ${response.status}`);
    }

    const data: Course[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching courses from real API:", error);
    return [];
  }
};