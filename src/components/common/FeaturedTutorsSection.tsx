import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';
import { TutorService } from '@/services/TutorService'; 
import type { Tutor } from '@/types/Tutor'; 

const FeaturedTutorsSection: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleTutors, setVisibleTutors] = useState(3); // Show 3 tutors initially

  useEffect(() => {
    const fetchTutors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Pass the searchTerm to the service
        const tutorsData = await TutorService.getFeaturedTutors(searchTerm); 
        setTutors(tutorsData);
      } catch (err) {
        setError('Failed to fetch tutors. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutors();
  }, [searchTerm]); // Refetch when searchTerm changes

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setVisibleTutors(3); // Reset visible count on new search
  };
  
  const handleShowMore = () => {
    setVisibleTutors(prev => prev + 3); 
  }

  if (isLoading) {
    return (
      <section className="py-8 md:py-16 bg-gray-950">
        <SectionHeader title="Featured Tutors" showSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Loading tutors...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-16 bg-gray-950">
        <SectionHeader title="Featured Tutors" showSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
        <div className="container mx-auto px-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  const renderTutorCards = () => {
    if (tutors.length === 0) {
      if (searchTerm) {
        return <p className="text-center text-gray-400 mt-8">No tutors found matching your search "{searchTerm}".</p>;
      }
      return <p className="text-center text-gray-400 mt-8">No featured tutors available at the moment.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.slice(0, visibleTutors).map((tutor) => (
          <Card key={tutor.id} className="flex flex-col bg-gray-900 border-gray-800 text-white">
            <CardHeader className="relative p-0">
              <img src={tutor.imageUrl} alt={tutor.name} className="w-full h-48 object-cover rounded-t-lg" />
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-700 rounded-full">
                <Heart className="h-5 w-5 text-blue-400" />
              </Button>
            </CardHeader>
            <CardContent className="flex-grow pt-4">
              <div className="flex items-center mb-1">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-semibold text-white">{tutor.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-400 ml-1">({tutor.reviews} reviews)</span>
              </div>
              <CardTitle className="text-xl mb-1 mt-1 text-white">{tutor.name}</CardTitle>
              <p className="text-sm text-gray-400 mb-1">Teaches: <span className="font-medium text-blue-400">{tutor.courses}</span></p>
              <p className="text-sm text-gray-400 mb-3">Price: <span className="font-semibold text-green-500">{tutor.price}</span></p>
              <h4 className="font-semibold mb-1 text-sm text-white">Details:</h4>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 max-h-24 overflow-y-auto">
                {tutor.tutoringInfo.map((info: string, index: number) => (
                  <li key={index} className="truncate">{info}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4 border-t border-gray-800 mt-auto">
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Register</Button>
              <Button variant="outline" className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700 text-white">Message</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <section className="py-8 md:py-16 bg-gray-950">
      <SectionHeader title="Featured Tutors" showSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
      <div className="container mx-auto px-4">
        {renderTutorCards()}
        {tutors.length > 0 && visibleTutors < tutors.length && (
          <div className="text-center mt-8">
            <Button onClick={handleShowMore} variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white">Show More Tutors</Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTutorsSection;
