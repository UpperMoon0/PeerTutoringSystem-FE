import { mockCourses } from '@/mocks/courses';
import type { Course } from '@/types/Course';
// Assuming CourseService might need authenticated calls in the future, 
// though getFeaturedCourses is public.
// import { AuthService } from './AuthService'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENABLE_MOCK_API = import.meta.env.VITE_ENABLE_MOCK_API === 'true';

// If other methods requiring auth are added, a similar _processJsonResponse helper
// from ProfileService or TutorService can be used here with AuthService.fetchWithAuth

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
      // This is a public endpoint, so direct fetch is fine.
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

// Example of how an authenticated call would look if needed in CourseService:
/*
import { AuthService } from './AuthService';
import type { ServiceResult } from '../types/ServiceResult'; // Or ApiResult depending on convention
async function _processJsonResponse<T>(responsePromise: Promise<Response>, url: string): Promise<ServiceResult<T>> {
  // ... implementation similar to ProfileService ...
}

export const getMyEnrolledCourses = async (): Promise<ServiceResult<Course[]>> => {
  const url = `${API_BASE_URL}/users/me/enrolled-courses`; // Example endpoint
  const responsePromise = AuthService.fetchWithAuth(url, { method: 'GET' });
  return _processJsonResponse<Course[]>(responsePromise, url);
};
*/
