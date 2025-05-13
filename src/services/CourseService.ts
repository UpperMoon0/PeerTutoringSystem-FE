import { mockCourses } from '@/mocks/courses';
import type { Course } from '@/types/Course';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENABLE_MOCK_API = import.meta.env.VITE_ENABLE_MOCK_API === 'true';

export const getFeaturedCourses = async (searchTerm?: string): Promise<Course[]> => {
  if (ENABLE_MOCK_API) {
    console.log(`[Mock API] Fetching featured courses. Search term: ${searchTerm}`);
    await new Promise(resolve => setTimeout(resolve, 300)); 
    if (searchTerm) {
      return mockCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tutor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return mockCourses;
  } else {
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
      return []; // Return an empty list on error
    }
  }
};
