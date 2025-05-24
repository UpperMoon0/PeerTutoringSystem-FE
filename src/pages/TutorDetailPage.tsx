import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookingService } from '@/services/BookingService';
import { TutorService } from '@/services/TutorService';
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
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils'; 

interface TutorProfile extends ProfileDto {
}

const TutorDetailPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { currentUser } = useAuth();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [tutorAccount, setTutorAccount] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availabilities, setAvailabilities] = useState<TutorAvailability[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<TutorAvailability | null>(null);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false); 

  // State for date range selection
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true); // For main profile loading
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorDetails = async () => {
      if (!tutorId) {
        setIsLoading(false);
        setError("Tutor ID is missing.");
        setTutor(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetches the main tutor profile
        const profileResponse = await TutorService.getTutorById(tutorId);
        if (profileResponse.success && profileResponse.data) {
          setTutor(profileResponse.data); 

        } else {
          setError(profileResponse.error as string || 'Failed to fetch tutor details.');
          setTutor(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not fetch tutor details.');
        setTutor(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorDetails();
  }, [tutorId]);

  const handleFetchAvailabilities = useCallback(async () => {
    if (!tutorId) {
        setIsFetchingSlots(false);
        return;
    }

    setBookingError(null);
    setBookingSuccess(null);
    setAvailabilities([]);
    setSelectedAvailability(null);
    setIsFetchingSlots(true);

    let effectiveStartDate: Date;
    let effectiveEndDate: Date;
    let localIsFetchAllMode = false;

    if (dateRangeStart && dateRangeEnd) { // User provided a specific range
      // Validation for end date < start date is handled by useEffect before calling this
      effectiveStartDate = dateRangeStart;
      effectiveEndDate = dateRangeEnd;
    } else if (dateRangeStart && !dateRangeEnd) { // Start date provided, end date not
      effectiveStartDate = dateRangeStart;
      effectiveEndDate = new Date(dateRangeStart);
      effectiveEndDate.setMonth(effectiveStartDate.getMonth() + 3);
      effectiveEndDate.setHours(23, 59, 59, 999); // End of the day for the end date
    } else if (!dateRangeStart && dateRangeEnd) { // End date provided, start date not
      effectiveStartDate = new Date(); // 5 minutes from now
      effectiveStartDate.setMinutes(effectiveStartDate.getMinutes() + 5);
      effectiveEndDate = dateRangeEnd;
      // Ensure start date is not after end date
      if (effectiveStartDate > effectiveEndDate) {
        effectiveStartDate = new Date(effectiveEndDate); 
        effectiveStartDate.setHours(0,0,0,0); // Start of that day
      }
    }
    else { // Neither date is provided by user (dates cleared or initial load)
      effectiveStartDate = new Date(); // 5 minutes from now
      effectiveStartDate.setMinutes(effectiveStartDate.getMinutes() + 5);
      
      effectiveEndDate = new Date(effectiveStartDate); // Start with the adjusted start date
      effectiveEndDate.setMonth(effectiveStartDate.getMonth() + 3); // 3 months from the (potentially future) start date
      // Set time to end of the day for end date for a full range
      effectiveEndDate.setHours(23, 59, 59, 999);
      localIsFetchAllMode = true;
    }
    
    // Ensure start date is not after end date, adjust if necessary (e.g. if only end date was picked and it's in the past)
    // This check is more robust here after all date manipulations
    if (effectiveEndDate < effectiveStartDate) {
        setBookingError("End date cannot be before start date. Please adjust your selection.");
        setIsFetchingSlots(false);
        return;
    }

    const startDateISO = effectiveStartDate.toISOString();
    const endDateISO = effectiveEndDate.toISOString();

    try {
      // BookingService.getTutorAvailableSlots expects string | undefined.
      // Here, startDateISO and endDateISO will always be strings.
      const response = await BookingService.getTutorAvailableSlots(tutorId, startDateISO, endDateISO);
      if (response.success && response.data) {
        const fetchedAvailabilities = response.data.availabilities || [];
        setAvailabilities(fetchedAvailabilities);
        if (fetchedAvailabilities.length === 0) {
          if (localIsFetchAllMode) {
            setBookingError("This tutor has no available slots in the next 3 months (starting from 5 minutes from now).");
          } else if (dateRangeStart && !dateRangeEnd) {
            setBookingError("This tutor has no available slots in the 3 months following your selected start date.");
          } else if (!dateRangeStart && dateRangeEnd) {
            setBookingError("This tutor has no available slots up to your selected end date (starting from 5 minutes from now).");
          }
           else {
            setBookingError("This tutor has no available slots in the selected range.");
          }
        }
      } else {
        setBookingError(response.error as string || 'Failed to fetch availabilities.');
      }
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Could not fetch availabilities.');
    } finally {
      setIsFetchingSlots(false);
    }
  }, [tutorId, dateRangeStart, dateRangeEnd]); // Removed handleFetchAvailabilities from its own dependencies

  // useEffect for fetching availabilities (dependent on tutorId, dateRangeStart, dateRangeEnd, and tutor)
  useEffect(() => {
    if (!tutorId || !tutor) { // Wait for tutor profile to be loaded
      setAvailabilities([]);
      setSelectedAvailability(null);
      // setBookingError(null); // Keep existing booking errors if any
      // setBookingSuccess(null); // Keep existing booking success if any
      setIsFetchingSlots(false);
      return;
    }

    // Case 1: Both dates are provided for a ranged search
    if (dateRangeStart && dateRangeEnd) {
      if (dateRangeEnd < dateRangeStart) {
        setAvailabilities([]);
        setSelectedAvailability(null);
        setBookingError("End date cannot be before start date.");
        setBookingSuccess(null);
        setIsFetchingSlots(false);
      } else {
        setBookingError(null); 
        handleFetchAvailabilities();
      }
    }
    // Case 2: Neither date is provided (tutorId and tutor profile are present) -> Fetch all
    else if (!dateRangeStart && !dateRangeEnd) {
      setBookingError(null); 
      handleFetchAvailabilities(); 
    }
    // Case 3: Only one date is provided (intermediate state) -> Clear/reset, don't fetch
    else {
      setAvailabilities([]);
      setSelectedAvailability(null);
      setBookingError(null);
      setIsFetchingSlots(false);
    }
  }, [tutorId, dateRangeStart, dateRangeEnd, handleFetchAvailabilities, tutor]);

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
          {/* Date Range Selection UI */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-end">
            <div className="flex-1 space-y-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRangeStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRangeStart ? format(dateRangeStart, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRangeStart}
                    onSelect={(date) => {
                      if (date) {
                        date.setHours(0,0,0,0);
                        setDateRangeStart(date);
                        if (dateRangeEnd && dateRangeEnd < date) {
                          const newEndDate = new Date(date);
                          newEndDate.setDate(newEndDate.getDate() + 7);
                          setDateRangeEnd(newEndDate);
                        }
                      }
                    }}
                    disabled={(date) => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate());
                      tomorrow.setHours(0,0,0,0);
                      return date < tomorrow;
                    }
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 space-y-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRangeEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRangeEnd ? format(dateRangeEnd, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRangeEnd}
                    onSelect={(date) => {
                       if(date) {
                        date.setHours(0,0,0,0);
                        setDateRangeEnd(date);
                       }
                    }}
                    disabled={(date) =>
                      dateRangeStart ? date < dateRangeStart : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleFetchAvailabilities} disabled={isLoading || !dateRangeStart || !dateRangeEnd} className="sm:w-auto">
              {isLoading ? 'Loading...' : 'View Slots'}
            </Button>
          </div>

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
