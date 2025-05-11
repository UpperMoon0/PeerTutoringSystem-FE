// TODO: Implement actual API endpoint and error handling

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Tutor {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  courses: string; 
  price: string;
  tutoringInfo: string[];
  // Add other relevant fields from your backend
}

// Placeholder for fetching featured tutors
export const getFeaturedTutors = async (searchTerm?: string): Promise<Tutor[]> => {
  console.log(`Fetching featured tutors. Search term: ${searchTerm}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Placeholder data - this should be replaced with an actual API call
  const placeholderTutors: Tutor[] = [
    {
      id: '1',
      name: 'Nguyễn Minh Anh',
      imageUrl: 'https://via.placeholder.com/150/FFC0CB/000000?Text=NMA',
      rating: 5,
      reviews: 34,
      courses: 'English, Advanced Mathematics, Microeconomics',
      price: '650.000 VND Course / 10 slot',
      tutoringInfo: [
        'Expert in English communication and exam prep.',
        'Teaches Advanced Mathematics with a focus on problem-solving.',
        'Microeconomics for university students.',
        '2 years of tutoring experience.',
      ],
    },
    {
      id: '2',
      name: 'Trần Văn Bảo',
      imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?Text=TVB',
      rating: 4.8,
      reviews: 28,
      courses: 'Physics, Chemistry, Programming Basics',
      price: '700.000 VND Course / 12 slot',
      tutoringInfo: [
        'Specializes in high school Physics and Chemistry.',
        'Introduction to Programming (Python, Java).',
        'Patient and methodical teaching style.',
        'Helped 20+ students achieve A grades.',
      ],
    },
    {
      id: '3',
      name: 'Lê Thị Cẩm',
      imageUrl: 'https://via.placeholder.com/150/90EE90/000000?Text=LTC',
      rating: 4.9,
      reviews: 45,
      courses: 'Literature, History, IELTS Preparation',
      price: '600.000 VND Course / 8 slot',
      tutoringInfo: [
        'Focuses on Vietnamese Literature and World History.',
        'IELTS Speaking and Writing coach.',
        'Interactive and engaging lessons.',
        '5 years of experience as a private tutor.',
      ],
    },
     {
      id: '4',
      name: 'Phạm Đức Huy',
      imageUrl: 'https://via.placeholder.com/150/FFFFE0/000000?Text=PDH',
      rating: 4.7,
      reviews: 22,
      courses: 'Calculus, Linear Algebra, Statistics',
      price: '750.000 VND Course / 10 slot',
      tutoringInfo: [
        'University-level Calculus and Linear Algebra.',
        'Statistics for social sciences.',
        'Clear explanations of complex concepts.',
      ],
    },
  ];
  
  if (searchTerm) {
    return placeholderTutors.filter(tutor =>
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.courses.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  return placeholderTutors;

  // Example of actual API call structure:
  // try {
  //   const response = await fetch(`${API_BASE_URL}/tutors/featured${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
  //   if (!response.ok) {
  //     throw new Error('Failed to fetch tutors');
  //   }
  //   const data: Tutor[] = await response.json();
  //   return data;
  // } catch (error) {
  //   console.error("Error fetching tutors:", error);
  //   // Return empty array or throw error, depending on how you want to handle in component
  //   return []; 
  // }
};

// Add other tutor-related API functions here (e.g., getTutorById, getAllTutors)
