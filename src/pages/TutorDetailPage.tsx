import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TutorService } from '@/services/TutorService';
import { UserSkillService } from '@/services/UserSkillService';
import { BookingService } from '@/services/BookingService';
import { ProfileService } from '@/services/ProfileService';
import type { ProfileDto, User } from '@/types/user.types'; 
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
  const [tutorAccount, setTutorAccount] = useState<User | null>(null); // State for tutor account details (including email)
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
        // Fetch UserBio details (ProfileDto)
        const tutorBioRes = await TutorService.getTutorById(tutorId);
        if (tutorBioRes.success && tutorBioRes.data) {
          setTutor(tutorBioRes.data as TutorProfile); 
        } else {
          throw new Error(tutorBioRes.error as string || 'Failed to fetch tutor bio details.');
        }

        // Fetch base User account details (for email)
        const tutorAccountRes = await ProfileService.getUserAccountById(tutorId);
        if (tutorAccountRes.success && tutorAccountRes.data) {
          setTutorAccount(tutorAccountRes.data);
        } else {
          // Not throwing an error here, as email might be considered optional by some views
          // but we should log it.
          console.error('Failed to fetch tutor account details:', tutorAccountRes.error);
          // setError('Failed to fetch tutor email.'); // Optionally set an error if email is critical
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
      startDate.setDate(startDate.getDate() + 1); // Set startDate to tomorrow
      startDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day

      const endDate = new Date(startDate);
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

  if (isLoading) return <p>Loading tutor profile...</p>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  if (!tutor) return <p>Tutor not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={tutor.avatarUrl} alt={tutor.fullName || tutorAccount?.fullName || "Tutor avatar"} />
            <AvatarFallback>{(tutor.fullName || tutorAccount?.fullName)?.charAt(0) || 'T'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl">{tutor.fullName || tutorAccount?.fullName || "Tutor"}</CardTitle>
            {/* Display email from tutorAccount state if available */}
            {tutorAccount && tutorAccount.email && <CardDescription>Email: {tutorAccount.email}</CardDescription>}
            {tutor.school && <CardDescription>School: {tutor.school}</CardDescription>}
          </div>
        </CardHeader>
        <CardContent>
          {tutor.bio && <p className="text-gray-700 mb-2"><strong>Bio:</strong> {tutor.bio}</p>}
          {tutor.hourlyRate !== undefined && <p className="text-gray-700 mb-2"><strong>Hourly Rate:</strong> ${tutor.hourlyRate.toFixed(2)}</p>}
          {tutor.experience && <p className="text-gray-700 mb-2"><strong>Experience:</strong> {tutor.experience}</p>}
          {tutor.availability && <p className="text-gray-700 mb-4"><strong>Availability:</strong> {tutor.availability}</p>}
          
          <h3 className="text-xl font-semibold mb-2">Skills</h3>
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
