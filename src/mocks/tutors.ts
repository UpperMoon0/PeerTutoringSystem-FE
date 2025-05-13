import type { Tutor } from '@/types/Tutor';

export const mockTutors: Tutor[] = [
  {
    id: 'mock-1',
    name: 'Nguyễn Minh Anh (Mock)',
    imageUrl: 'https://via.placeholder.com/150/FFC0CB/000000?Text=NMA-Mock',
    rating: 5,
    reviews: 34,
    courses: 'English, Advanced Mathematics, Microeconomics',
    price: '650.000 VND Course / 10 slot',
    tutoringInfo: [
      'Expert in English communication and exam prep (Mock Data).',
      'Teaches Advanced Mathematics with a focus on problem-solving (Mock Data).',
      'Microeconomics for university students (Mock Data).',
      '2 years of tutoring experience (Mock Data).',
    ],
  },
  {
    id: 'mock-2',
    name: 'Trần Văn Bảo (Mock)',
    imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?Text=TVB-Mock',
    rating: 4.8,
    reviews: 28,
    courses: 'Physics, Chemistry, Programming Basics',
    price: '700.000 VND Course / 12 slot',
    tutoringInfo: [
      'Specializes in high school Physics and Chemistry (Mock Data).',
      'Introduction to Programming (Python, Java) (Mock Data).',
      'Patient and methodical teaching style (Mock Data).',
      'Helped 20+ students achieve A grades (Mock Data).',
    ],
  },
  {
    id: 'mock-3',
    name: 'Lê Thị Cẩm (Mock)',
    imageUrl: 'https://via.placeholder.com/150/90EE90/000000?Text=LTC-Mock',
    rating: 4.9,
    reviews: 45,
    courses: 'Literature, History, IELTS Preparation',
    price: '600.000 VND Course / 8 slot',
    tutoringInfo: [
      'Focuses on Vietnamese Literature and World History (Mock Data).',
      'IELTS Speaking and Writing coach (Mock Data).',
      'Interactive and engaging lessons (Mock Data).',
      '5 years of experience as a private tutor (Mock Data).',
    ],
  },
   {
    id: 'mock-4',
    name: 'Phạm Đức Huy (Mock)',
    imageUrl: 'https://via.placeholder.com/150/FFFFE0/000000?Text=PDH-Mock',
    rating: 4.7,
    reviews: 22,
    courses: 'Calculus, Linear Algebra, Statistics',
    price: '750.000 VND Course / 10 slot',
    tutoringInfo: [
      'University-level Calculus and Linear Algebra (Mock Data).',
      'Statistics for social sciences (Mock Data).',
      'Clear explanations of complex concepts (Mock Data).',
    ],
  },
];
