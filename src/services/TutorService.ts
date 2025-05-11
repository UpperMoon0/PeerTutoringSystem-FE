import { mockTutors } from '@/mocks/tutors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENABLE_MOCK_API = import.meta.env.VITE_ENABLE_MOCK_API === 'true';

export interface Tutor {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  courses: string;
  price: string;
  tutoringInfo: string[];
}

export const getFeaturedTutors = async (searchTerm?: string): Promise<Tutor[]> => {
  if (ENABLE_MOCK_API) {
    console.log(`[Mock API] Fetching featured tutors. Search term: ${searchTerm}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    if (searchTerm) {
      return mockTutors.filter(tutor =>
        tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.courses.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return mockTutors;
  } else {
    console.log(`[Real API] Fetching featured tutors. Search term: ${searchTerm}`);
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`${API_BASE_URL}/tutors/featured${query}`); 
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error ${response.status}: ${response.statusText}`, errorBody);
        throw new Error(`Failed to fetch tutors. Status: ${response.status}`);
      }
      
      const data: Tutor[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching tutors from real API:", error);
      throw error; 
    }
  }
};

