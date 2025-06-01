import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { getFeaturedCourses } from '@/services/CourseService'; 
import type { Course } from '@/types/Course';

const FeaturedCoursesSection: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCourses, setVisibleCourses] = useState(3); // Show 3 courses initially

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getFeaturedCourses(searchTerm);
        setCourses(data);
      } catch (err) {
        setError('Failed to fetch courses. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm]); // Refetch when searchTerm changes

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setVisibleCourses(3); // Reset visible count on new search
  };
  
  const handleShowMore = () => {
    setVisibleCourses(prev => prev + 3);
  };

  if (isLoading) {
    return (
      <section className="py-8 md:py-16 bg-gray-950">
        <SectionHeader title="Featured Courses" showSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Loading courses...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-16 bg-gray-950">
        <SectionHeader title="Featured Courses" showSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
        <div className="container mx-auto px-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  const renderCourseCards = () => {
    if (courses.length === 0) {
      if (searchTerm) {
        return <p className="text-center text-gray-400 mt-8">No courses found matching your search "{searchTerm}".</p>;
      }
      return <p className="text-center text-gray-400 mt-8">No featured courses available at the moment.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.slice(0, visibleCourses).map((course) => (
          <Card key={course.id} className="flex flex-col bg-gray-900 border-gray-800 text-white">
            <CardHeader className="p-0">
              <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
            </CardHeader>
            <CardContent className="flex-grow pt-4">
              <CardTitle className="text-lg font-semibold mb-1 leading-tight text-white">{course.title}</CardTitle>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{course.description}</p> {/* Added line-clamp */}
              <p className="text-xs text-gray-400">Tutor: <span className="font-medium text-blue-400">{course.tutor}</span></p>
              <p className="text-xs text-gray-400">Price: <span className="font-medium text-green-500">{course.price}</span> / {course.duration}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-3 pb-4 px-4 border-t border-gray-800 mt-auto"> {/* Added border-t and mt-auto */}
              <div className="flex items-center text-xs text-gray-400">
                <Users className="h-3 w-3 mr-1" />
                {course.lecturers} Lecturers
              </div>
              <Button size="sm" className="text-xs h-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Learn More</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <section className="py-8 md:py-16 bg-gray-950">
      <SectionHeader title="Featured Courses" showSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
      <div className="container mx-auto px-4">
        {renderCourseCards()}
        {courses.length > 0 && visibleCourses < courses.length && (
          <div className="text-center mt-8">
            <Button onClick={handleShowMore} variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white">Show More Courses</Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
