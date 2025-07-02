import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ReviewService } from '@/services/ReviewService';
import { TutorService } from '@/services/TutorService';
import { TutorProfileService } from '@/services/TutorProfileService';
import { UserSkillService } from '@/services/UserSkillService';
import StarRating from '@/components/ui/StarRating';
import type { User } from '@/types/user.types';
import type { TutorProfileDto } from '@/types/TutorProfile';
import type { UserSkill } from '@/types/skill.types';

interface FeaturedTutor {
  tutorId: string;
  tutorName: string;
  email: string;
  averageRating: number;
  reviewCount: number;
  tutorProfile?: TutorProfileDto;
  tutorAccount?: User;
  skills?: UserSkill[];
}

const FeaturedTutorsCarousel: React.FC = () => {
  const [tutors, setTutors] = useState<FeaturedTutor[]>([]);
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
        // Get top 10 tutors by rating
        const topTutorsResult = await ReviewService.getTopTutorsByRating(10);
        
        if (topTutorsResult.success && topTutorsResult.data) {
          const tutorsWithDetails = await Promise.all(
            topTutorsResult.data.map(async (tutor) => {
              // Fetch additional details for each tutor
              const [userResult, profileResult, skillsResult] = await Promise.all([
                TutorService.getAllTutors().then(result => 
                  result.success && result.data ? 
                    result.data.find(u => u.userID === tutor.tutorId) : 
                    undefined
                ),
                TutorProfileService.getTutorProfileByUserId(tutor.tutorId),
                UserSkillService.getUserSkills(tutor.tutorId)
              ]);

              return {
                ...tutor,
                tutorAccount: userResult,
                tutorProfile: profileResult.success ? profileResult.data : undefined,
                skills: skillsResult.success ? skillsResult.data : []
              };
            })
          );

          setTutors(tutorsWithDetails);
        } else {
          setError('Failed to load featured tutors');
        }
      } catch (err) {
        setError('An error occurred while loading tutors');
        console.error('Error fetching featured tutors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTutors();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (tutors.length <= itemsPerView) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [tutors.length, totalSlides]);

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
              className="flex transition-transform duration-300 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(tutors.length / itemsPerView) * 100}%`
              }}
            >
              {tutors.map((tutor) => (
                <div 
                  key={tutor.tutorId} 
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / tutors.length}%` }}
                >
                  <Card className="bg-card border-border text-card-foreground h-full flex flex-col">
                    <CardHeader className="text-center pb-4">
                      <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-border">
                        <AvatarImage
                          src={tutor.tutorAccount?.avatarUrl}
                          alt={tutor.tutorName}
                        />
                        <AvatarFallback className="bg-accent text-muted-foreground text-2xl">
                          {tutor.tutorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl text-card-foreground">{tutor.tutorName}</CardTitle>
                      
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
                      {tutor.tutorProfile?.bio && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                          {tutor.tutorProfile.bio}
                        </p>
                      )}
                      
                      {/* Experience and Rate */}
                      <div className="text-sm text-muted-foreground mb-3 space-y-1">
                        {tutor.tutorProfile?.experience && (
                          <p><strong className="text-foreground">Experience:</strong> {tutor.tutorProfile.experience}</p>
                        )}
                        {tutor.tutorProfile?.hourlyRate !== undefined && (
                          <p><strong className="text-foreground">Rate:</strong> ${tutor.tutorProfile.hourlyRate}/hr</p>
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
                        <Link to={`/tutors/${tutor.tutorId}`}>
                          <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-primary-foreground">
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