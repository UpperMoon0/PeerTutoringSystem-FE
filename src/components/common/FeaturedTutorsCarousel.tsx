import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TutorService } from '@/services/TutorService';
import StarRating from '@/components/ui/StarRating';
import type { EnrichedTutor } from '@/types/enrichedTutor.types';

const FeaturedTutorsCarousel: React.FC = () => {
  const [tutors, setTutors] = useState<EnrichedTutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsPerView = 3; // Show 3 cards at a time
  const totalSlides = Math.max(0, tutors.length - itemsPerView + 1);

  useEffect(() => {
    const fetchFeaturedTutors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await TutorService.getAllEnrichedTutors({ sortBy: 'rating', limit: 10 });

        if (result.success && result.data) {
          setTutors(result.data);
        } else {
          if (typeof result.error === 'string') {
            setError(result.error);
          } else if (result.error) {
            setError(result.error.message);
          } else {
            setError('Failed to load featured tutors');
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while loading tutors');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTutors();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (tutors.length <= itemsPerView) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [tutors.length, totalSlides, nextSlide]);


  if (isLoading) {
    return (
      <section className="py-8 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
            Featured Tutors
          </h2>
          <div className="text-center text-muted-foreground">
            <p>Loading featured tutors...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
            Featured Tutors
          </h2>
          <div className="text-center text-destructive-foreground">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (tutors.length === 0) {
    return (
      <section className="py-8 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
            Featured Tutors
          </h2>
          <div className="text-center text-muted-foreground">
            <p>No featured tutors available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
          Featured Tutors
        </h2>
        
        <div className="relative">
          {/* Carousel container */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div 
              className="flex transition-transform duration-300 ease-in-out gap-4"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {tutors.map((tutor) => (
                <div
                  key={tutor.userID}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / itemsPerView}% - 1rem)` }}
                >
                  <Card className="bg-card border-border text-card-foreground h-full flex flex-col">
                    <CardHeader className="text-center pb-4">
                      <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-border">
                        <AvatarImage
                          src={tutor.avatarUrl}
                          alt={tutor.fullName}
                        />
                        <AvatarFallback className="bg-accent text-muted-foreground text-2xl">
                          {tutor.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl text-card-foreground">{tutor.fullName}</CardTitle>
                      
                      {/* Rating */}
                      <div className="mt-2">
                        <StarRating
                          rating={tutor.averageRating}
                          reviewCount={tutor.reviewCount}
                          size="sm"
                          className="justify-center"
                        />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-grow pt-0">
                      {/* Bio */}
                      {tutor.bio && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                          {tutor.bio}
                        </p>
                      )}
                      
                      {/* Experience and Rate */}
                      <div className="text-sm text-muted-foreground mb-3 space-y-1">
                        {tutor.experience && (
                          <p><strong className="text-foreground">Experience:</strong> {tutor.experience}</p>
                        )}
                        {tutor.hourlyRate !== undefined && (
                          <p><strong className="text-foreground">Rate:</strong> ${tutor.hourlyRate}/hr</p>
                        )}
                      </div>
                      
                      {/* Skills */}
                      {tutor.skills && tutor.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Skills:</h4>
                          <div className="flex flex-wrap gap-1">
                            {tutor.skills.slice(0, 3).map((userSkill) => (
                              <Badge
                                key={userSkill.userSkillID}
                                variant="secondary"
                                className="bg-secondary text-primary text-xs"
                              >
                                {userSkill.skill.skillName}
                              </Badge>
                            ))}
                            {tutor.skills.length > 3 && (
                              <Badge variant="secondary" className="bg-secondary text-muted-foreground text-xs">
                                +{tutor.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* View Profile Button */}
                      <div className="mt-auto pt-4">
                        <Link to={`/tutors/${tutor.userID}`}>
                          <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          {tutors.length > itemsPerView && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-secondary/80 border-border hover:bg-secondary text-foreground z-10"
                onClick={prevSlide}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-secondary/80 border-border hover:bg-secondary text-foreground z-10"
                onClick={nextSlide}
                disabled={currentIndex >= totalSlides - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* Dots indicator */}
          {tutors.length > itemsPerView && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTutorsCarousel;