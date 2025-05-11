import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';
import { type Tutor, getFeaturedTutors } from '@/services/TutorService'; // Import service and type

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
        const data = await getFeaturedTutors(searchTerm);
        setTutors(data);
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
      <section className="py-8 md:py-16 bg-background">
        <SectionHeader title="Featured Tutors" showSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
        <div className="container mx-auto px-4 text-center">
          <p>Loading tutors...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-16 bg-background">
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
        return <p className="text-center text-muted-foreground mt-8">No tutors found matching your search "{searchTerm}".</p>;
      }
      return <p className="text-center text-muted-foreground mt-8">No featured tutors available at the moment.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.slice(0, visibleTutors).map((tutor) => (
          <Card key={tutor.id} className="flex flex-col">
            <CardHeader className="relative p-0">
              <img src={tutor.imageUrl} alt={tutor.name} className="w-full h-48 object-cover rounded-t-lg" />
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/70 hover:bg-white rounded-full">
                <Heart className="h-5 w-5 text-primary" />
              </Button>
            </CardHeader>
            <CardContent className="flex-grow pt-4">
              <div className="flex items-center mb-1">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-semibold">{tutor.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground ml-1">({tutor.reviews} reviews)</span>
              </div>
              <CardTitle className="text-xl mb-1 mt-1">{tutor.name}</CardTitle>
              <p className="text-sm text-muted-foreground mb-1">Teaches: <span className="font-medium">{tutor.courses}</span></p>
              <p className="text-sm text-muted-foreground mb-3">Price: <span className="font-semibold text-primary">{tutor.price}</span></p>
              <h4 className="font-semibold mb-1 text-sm">Details:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-24 overflow-y-auto">
                {tutor.tutoringInfo.map((info, index) => (
                  <li key={index} className="truncate">{info}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4 border-t mt-auto">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Register</Button>
              <Button variant="outline" className="flex-1">Message</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <section className="py-8 md:py-16 bg-background">
      <SectionHeader title="Featured Tutors" showSearch onSearchChange={handleSearchChange} searchTerm={searchTerm} />
      <div className="container mx-auto px-4">
        {renderTutorCards()}
        {tutors.length > 0 && visibleTutors < tutors.length && (
          <div className="text-center mt-8">
            <Button onClick={handleShowMore} variant="outline">Show More Tutors</Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTutorsSection;
