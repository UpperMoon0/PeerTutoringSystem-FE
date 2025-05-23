import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TutorService } from '@/services/TutorService';
import { UserSkillService } from '@/services/UserSkillService';
import { BookingService } from '@/services/BookingService';
import type { ProfileDto } from '@/types/user.types'; 
import type { Skill } from '@/types/skill.types';
import type { TutorAvailability } from '@/types/tutorAvailability.types'; 
import type { CreateBookingDto } from '@/types/booking.types'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TutorProfile extends ProfileDto {
}

const TutorDetailPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { currentUser } = useAuth();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availabilities, setAvailabilities] = useState<TutorAvailability[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<TutorAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!tutorId) return;

    const fetchTutorData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const tutorRes = await TutorService.getTutorById(tutorId);
        if (tutorRes.success && tutorRes.data) {
          setTutor(tutorRes.data as TutorProfile); 
        } else {
          throw new Error(tutorRes.error as string || 'Failed to fetch tutor details.');
        }

        const skillsRes = await UserSkillService.getUserSkills(tutorId);
        if (skillsRes.success && skillsRes.data) {
          setSkills(skillsRes.data.map(userSkill => userSkill.skill));
        } else {
          console.error('Failed to fetch tutor skills:', skillsRes.error);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorData();
  }, [tutorId]);

  const handleFetchAvailabilities = async () => {
    if (!tutorId) return;
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 7);

      const response = await BookingService.getTutorAvailableSlots(tutorId, startDate.toISOString(), endDate.toISOString());
      if (response.success && response.data) {
        setAvailabilities(response.data.availabilities || []);
        if ((response.data.availabilities || []).length === 0) {
          setBookingError("This tutor has no available slots in the selected range.");
        }
      } else {
        setBookingError(response.error as string || 'Failed to fetch availabilities.');
      }
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Could not fetch availabilities.');
    }
  };

  const handleBookSession = async () => {
    if (!currentUser || !tutor || !selectedAvailability || !tutorId) {
      setBookingError("Please select an availability slot and ensure you are logged in.");
      return;
    }
    setBookingError(null);
    setBookingSuccess(null);
    setIsLoading(true);

    const bookingData: CreateBookingDto = {
      tutorId: tutorId,
      studentId: currentUser.userId, 
      availabilityId: selectedAvailability.availabilityId, 
      startTime: selectedAvailability.startTime, 
      endTime: selectedAvailability.endTime,     
    };

    try {
      const response = await BookingService.createBooking(bookingData);
      if (response.success && response.data) {
        setBookingSuccess(`Booking confirmed for ${new Date(selectedAvailability.startTime).toLocaleString()}!`);
        setSelectedAvailability(null);
        handleFetchAvailabilities();
      } else {
        setBookingError(response.error as string || 'Failed to create booking.');
      }
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'An error occurred during booking.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !tutor) return <div className="container mx-auto p-4">Loading tutor details...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!tutor) return <div className="container mx-auto p-4">Tutor not found.</div>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={tutor.avatarUrl || undefined} alt={tutor.fullName} />
            <AvatarFallback>{tutor.fullName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{tutor.fullName}</CardTitle>
            <CardDescription>{tutor.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {tutor.bio && (
            <>
              <h3 className="text-xl font-semibold mt-4 mb-2">Bio</h3>
              <p className="text-muted-foreground">{tutor.bio}</p>
            </>
          )}

          <h3 className="text-xl font-semibold mt-6 mb-2">Skills</h3>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill.skillID} variant="secondary">{skill.skillName}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No skills listed.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Book a Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleFetchAvailabilities} disabled={isLoading}>
            {isLoading ? 'Loading Availabilities...' : 'View Available Slots'}
          </Button>

          {bookingError && <Alert variant="destructive"><AlertDescription>{bookingError}</AlertDescription></Alert>}
          {bookingSuccess && <Alert variant="default" className="bg-green-100 text-green-700"><AlertDescription>{bookingSuccess}</AlertDescription></Alert>}

          {availabilities.length > 0 && (
            <div className="space-y-2 pt-4">
              <h4 className="font-semibold">Available Slots:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {availabilities.filter(slot => !slot.isBooked).map(avail => (
                  <li key={avail.availabilityId}>
                    <Button
                      variant={selectedAvailability?.availabilityId === avail.availabilityId ? "default" : "outline"}
                      className="w-full text-left justify-start h-auto py-2"
                      onClick={() => setSelectedAvailability(avail)}
                    >
                      <div className="flex flex-col">
                        <span>{format(new Date(avail.startTime), "PPP, p")}</span>
                        <span>to {format(new Date(avail.endTime), "p")}</span>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {selectedAvailability && !bookingSuccess && (
            <div className="pt-4 space-y-3">
              <p>Selected: <strong>{format(new Date(selectedAvailability.startTime), "PPP, p")}</strong> to <strong>{format(new Date(selectedAvailability.endTime), "p")}</strong></p>
              <Button onClick={handleBookSession} disabled={isLoading || !currentUser} className="w-full">
                {isLoading ? 'Booking...' : 'Confirm Booking'}
              </Button>
              {!currentUser && <p className="text-sm text-red-500">Please log in to book a session.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorDetailPage;
