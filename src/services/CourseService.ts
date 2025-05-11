// TODO: Implement actual API endpoint and error handling

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tutor: string; // Could be an object with tutor details if needed
  price: string;
  duration: string;
  lecturers: number; // Or studentsEnrolled, depending on your data model
  // Add other relevant fields from your backend
}

// Placeholder for fetching featured courses
export const getFeaturedCourses = async (searchTerm?: string): Promise<Course[]> => {
  console.log(`Fetching featured courses. Search term: ${searchTerm}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Placeholder data - this should be replaced with an actual API call
  const placeholderCourses: Course[] = [
    {
      id: '1',
      title: 'Advanced Business English Communication',
      description: 'Learn real-world Business English to communicate with confidence.',
      imageUrl: 'https://via.placeholder.com/300x180/E0E0E0/000000?Text=Course1',
      tutor: 'Nguyễn Minh Anh',
      price: '650.000 VND / course',
      duration: '10 slot',
      lecturers: 10,
    },
    {
      id: '2',
      title: 'Data Analysis with Python',
      description: 'Master data analysis techniques using Python and popular libraries.',
      imageUrl: 'https://via.placeholder.com/300x180/D0D0D0/000000?Text=Course2',
      tutor: 'Trần Văn Bảo',
      price: '800.000 VND / course',
      duration: '15 slot',
      lecturers: 12,
    },
    {
      id: '3',
      title: 'Introduction to Web Development',
      description: 'Build your first website with HTML, CSS, and JavaScript.',
      imageUrl: 'https://via.placeholder.com/300x180/C0C0C0/000000?Text=Course3',
      tutor: 'Lê Thị Cẩm',
      price: '500.000 VND / course',
      duration: '8 slot',
      lecturers: 8,
    },
     {
      id: '4',
      title: 'Digital Marketing Fundamentals',
      description: 'Explore the basics of digital marketing and online advertising.',
      imageUrl: 'https://via.placeholder.com/300x180/B0B0B0/000000?Text=Course4',
      tutor: 'Phạm Văn Dũng',
      price: '700.000 VND / course',
      duration: '12 slot',
      lecturers: 15,
    },
     {
      id: '5',
      title: 'Graphic Design for Beginners',
      description: 'Learn the fundamentals of graphic design using popular tools.',
      imageUrl: 'https://via.placeholder.com/300x180/A0A0A0/000000?Text=Course5',
      tutor: 'Hoàng Thị Mai',
      price: '600.000 VND / course',
      duration: '10 slot',
      lecturers: 9,
    },
    {
      id: '6',
      title: 'Mobile App Development with React Native',
      description: 'Create cross-platform mobile apps with React Native.',
      imageUrl: 'https://via.placeholder.com/300x180/909090/000000?Text=Course6',
      tutor: 'Vũ Minh Đức',
      price: '900.000 VND / course',
      duration: '20 slot',
      lecturers: 7,
    },
  ];

  if (searchTerm) {
    return placeholderCourses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tutor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  return placeholderCourses;

  // Example of actual API call structure:
  // try {
  //   const response = await fetch(`${API_BASE_URL}/courses/featured${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
  //   if (!response.ok) {
  //     throw new Error('Failed to fetch courses');
  //   }
  //   const data: Course[] = await response.json();
  //   return data;
  // } catch (error) {
  //   console.error("Error fetching courses:", error);
  //   return []; 
  // }
};

// Add other course-related API functions here (e.g., getCourseById, getAllCourses)
