import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookingService } from '@/services/BookingService';
import { TutorService } from '@/services/TutorService';
import { UserSkillService } from '@/services/UserSkillService';
import { ReviewService } from '@/services/ReviewService';
import type { ProfileDto, User } from '@/types/user.types';
import type { Skill, UserSkill } from '@/types/skill.types';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/ui/StarRating';

type TutorProfile = ProfileDto;

const TutorDetailPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { currentUser } = useAuth();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [tutorAccount] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availabilities, setAvailabilities] = useState<TutorAvailability[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<TutorAvailability | null>(null);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [rating, setRating] = useState<{ averageRating: number; reviewCount: number }>({ averageRating: 0, reviewCount: 0 });
  const [ratingLoading, setRatingLoading] = useState<boolean>(true);

  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedSkillId] = useState<string | undefined>(undefined);


  const getProcessedAvailabilities = useCallback((slotsToProcess: TutorAvailability[]): TutorAvailability[] => {
    interface RecurringGroup {
      slots: TutorAvailability[];
      minDate: Date;
      maxDate: Date; // Tracks the start date of the latest slot in the group
      originalRecurrenceEndDate?: Date | null; // From backend, if consistent for the group
    }

    const recurringGroups: Record<string, RecurringGroup> = {};
    const nonRecurringSlots: TutorAvailability[] = [];

    for (const slot of slotsToProcess) {
      if (slot.isRecurring) {
        try {
          const startTimeDate = new Date(slot.startTime);
          const endTimeDate = new Date(slot.endTime);

          if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
            nonRecurringSlots.push(slot);
            continue;
          }

          const timeKey = `${slot.recurringDay || 'UNKNOWN_DAY'}-${format(startTimeDate, "HH:mm")}-${format(endTimeDate, "HH:mm")}`;

          if (!recurringGroups[timeKey]) {
            recurringGroups[timeKey] = {
              slots: [],
              minDate: startTimeDate,
              maxDate: startTimeDate,
              originalRecurrenceEndDate: slot.recurrenceEndDate ? new Date(slot.recurrenceEndDate) : null,
            };
          }
          
          recurringGroups[timeKey].slots.push(slot);
          if (startTimeDate < recurringGroups[timeKey].minDate) {
            recurringGroups[timeKey].minDate = startTimeDate;
          }
          if (startTimeDate > recurringGroups[timeKey].maxDate) {
            recurringGroups[timeKey].maxDate = startTimeDate;
          }
          if (slot.recurrenceEndDate && !recurringGroups[timeKey].originalRecurrenceEndDate) {
              recurringGroups[timeKey].originalRecurrenceEndDate = new Date(slot.recurrenceEndDate);
          }

        } catch {
          nonRecurringSlots.push(slot);
        }
      } else {
        nonRecurringSlots.push(slot);
      }
    }

    const finalProcessedSlots: TutorAvailability[] = [...nonRecurringSlots];

    for (const key in recurringGroups) {
      const group = recurringGroups[key];
      if (group.slots.length > 0) {
        const sortedSlotsInGroup = group.slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        const firstSlotInGroup = sortedSlotsInGroup[0];

        let displayUntilDate: Date | null = null;
        if (group.originalRecurrenceEndDate) {
          displayUntilDate = group.originalRecurrenceEndDate;
        } else {
          displayUntilDate = group.maxDate;
        }
        
        const summaryDisplaySlot: TutorAvailability = {
          ...firstSlotInGroup,
          startTime: new Date(group.minDate).toISOString(),
          recurrenceEndDate: displayUntilDate ? format(displayUntilDate, "yyyy-MM-dd") : null,
        };
        finalProcessedSlots.push(summaryDisplaySlot);
      }
    }

    finalProcessedSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return finalProcessedSlots;
  }, [format]);

  const displaySlots = useMemo(() => {
    const unbookedSlots = availabilities.filter(slot => !slot.isBooked);
    return getProcessedAvailabilities(unbookedSlots);
  }, [availabilities, getProcessedAvailabilities]);


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

  // Fetch tutor skills
  useEffect(() => {
    const fetchTutorSkills = async () => {
      if (!tutorId) {
        setSkills([]);
        return;
      }
      
      try {
        const skillsResponse = await UserSkillService.getUserSkills(tutorId);
        if (skillsResponse.success && skillsResponse.data) {
          // Extract the Skill objects from UserSkill objects
          const tutorSkills = skillsResponse.data
            .filter((userSkill: UserSkill) => userSkill.isTutor)
            .map((userSkill: UserSkill) => userSkill.skill);
          setSkills(tutorSkills);
        } else {
          console.warn('Failed to fetch tutor skills:', skillsResponse.error);
          setSkills([]);
        }
      } catch (err) {
        console.warn('Error fetching tutor skills:', err);
        setSkills([]);
      }
    };
    
    fetchTutorSkills();
  }, [tutorId]);

  // Fetch tutor rating
  useEffect(() => {
    const fetchTutorRating = async () => {
      if (!tutorId) {
        setRating({ averageRating: 0, reviewCount: 0 });
        setRatingLoading(false);
        return;
      }
      
      setRatingLoading(true);
      try {
        const [avgRatingResult, reviewsResult] = await Promise.all([
          ReviewService.getAverageRatingByTutorId(tutorId),
          ReviewService.getReviewsByTutorId(tutorId)
        ]);

        const averageRating = avgRatingResult.success && avgRatingResult.data ? avgRatingResult.data.averageRating : 0;
        const reviewCount = reviewsResult.success && reviewsResult.data ? reviewsResult.data.length : 0;
        
        setRating({ averageRating, reviewCount });
      } catch (err) {
        console.warn('Error fetching tutor rating:', err);
        setRating({ averageRating: 0, reviewCount: 0 });
      } finally {
        setRatingLoading(false);
      }
    };
    
    fetchTutorRating();
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

    if (dateRangeStart && dateRangeEnd) {
      effectiveStartDate = dateRangeStart;
      effectiveEndDate = dateRangeEnd;
    } else if (dateRangeStart && !dateRangeEnd) {
      effectiveStartDate = dateRangeStart;
      effectiveEndDate = new Date(dateRangeStart);
      effectiveEndDate.setMonth(effectiveStartDate.getMonth() + 3);
      effectiveEndDate.setHours(23, 59, 59, 999);
    } else if (!dateRangeStart && dateRangeEnd) {
      effectiveStartDate = new Date(); 
      effectiveStartDate.setMinutes(effectiveStartDate.getMinutes() + 5);
      effectiveEndDate = dateRangeEnd;
      if (effectiveStartDate > effectiveEndDate) {
        effectiveStartDate = new Date(effectiveEndDate); 
        effectiveStartDate.setHours(0,0,0,0);
      }
    }
    else { 
      effectiveStartDate = new Date(); 
      effectiveStartDate.setMinutes(effectiveStartDate.getMinutes() + 5);
      effectiveEndDate = new Date(effectiveStartDate); 
      effectiveEndDate.setMonth(effectiveStartDate.getMonth() + 3); 
      effectiveEndDate.setHours(23, 59, 59, 999);
      localIsFetchAllMode = true;
    }
    
    if (effectiveEndDate < effectiveStartDate) {
        setBookingError("End date cannot be before start date. Please adjust your selection.");
        setIsFetchingSlots(false);
        return;
    }

    const startDateISO = effectiveStartDate.toISOString();
    const endDateISO = effectiveEndDate.toISOString();

    try {
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
  }, [tutorId, dateRangeStart, dateRangeEnd]);

  useEffect(() => {
    if (!tutorId || !tutor) { 
      setAvailabilities([]);
      setSelectedAvailability(null);
      setIsFetchingSlots(false);
      return;
    }
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
    else if (!dateRangeStart && !dateRangeEnd) {
      setBookingError(null); 
      handleFetchAvailabilities(); 
    }
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
    if (!topic.trim()) {
      setBookingError("Please enter a topic for the session.");
      return;
    }
    if (!description.trim()) {
      setBookingError("Please enter a description for the session.");
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
      topic: topic, 
      description: description, 
      skillId: selectedSkillId, 
    };

    try {
      const response = await BookingService.createBooking(bookingData);
      if (response.success && response.data) {
        setBookingSuccess(`Booking confirmed for ${new Date(selectedAvailability.startTime).toLocaleString()}!`);
        setSelectedAvailability(null);
        setTopic("");
        setDescription("");
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

  if (isLoading && !tutor) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6"><p>Loading tutor profile...</p></div>;
  if (error) return <div className="min-h-screen bg-gray-950 text-white p-6"><Alert variant="destructive" className="bg-red-900 border-red-700 text-red-200"><AlertDescription>{error}</AlertDescription></Alert></div>;
  if (!tutor) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6"><p>Tutor not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 space-y-6">
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 p-6">
          <Avatar className="h-28 w-28 border-2 border-gray-700">
            <AvatarImage src={tutor.avatarUrl} alt={tutor.tutorName || tutorAccount?.fullName || "Tutor avatar"} />
            <AvatarFallback className="bg-gray-700 text-gray-300 text-4xl">{(tutor.tutorName || tutorAccount?.fullName)?.charAt(0) || 'T'}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <CardTitle className="text-3xl text-white">{tutor.tutorName || tutorAccount?.fullName || "Tutor"}</CardTitle>
            {tutorAccount && tutorAccount.email && <CardDescription className="text-gray-400">Email: {tutorAccount.email}</CardDescription>}
            {tutor.school && <CardDescription className="text-gray-400">School: {tutor.school}</CardDescription>}
            
            {/* Rating Section */}
            <div className="mt-3">
              {ratingLoading ? (
                <p className="text-sm text-gray-400">Loading rating...</p>
              ) : (
                <StarRating
                  rating={rating.averageRating}
                  reviewCount={rating.reviewCount}
                  size="md"
                  className="justify-center md:justify-start"
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {tutor.bio && <p className="text-gray-300"><strong className="text-gray-100">Bio:</strong> {tutor.bio}</p>}
          {tutor.hourlyRate !== undefined && <p className="text-gray-300"><strong className="text-gray-100">Hourly Rate:</strong> ${tutor.hourlyRate.toFixed(2)}</p>}
          {tutor.experience && <p className="text-gray-300"><strong className="text-gray-100">Experience:</strong> {tutor.experience}</p>}
          {tutor.availability && <p className="text-gray-300 mb-3"><strong className="text-gray-100">General Availability:</strong> {tutor.availability}</p>}
          
          <h3 className="text-xl font-semibold text-white pt-3 border-t border-gray-800">Skills</h3>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill.skillID} variant="secondary" className="bg-gray-750 text-blue-300 hover:bg-gray-700 text-sm px-3 py-1">{skill.skillName}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills listed for this tutor.</p>
          )}
        </CardContent>
      </Card>

      {/* Only show booking section for authenticated users who are not admins */}
      {currentUser && currentUser.role !== 'Admin' && (
        <Card className="bg-gray-900 border-gray-800 shadow-xl">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl text-white">Book a Session</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-750 text-white",
                        !dateRangeStart && "text-gray-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-gray-400" />
                      {dateRangeStart ? format(dateRangeStart, "PPP") : <span>Pick a start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700 text-white" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRangeStart}
                      onSelect={(date) => {
                        if (date) {
                          date.setHours(0,0,0,0);
                          setDateRangeStart(date);
                          if (dateRangeEnd && dateRangeEnd < date) { // Auto-adjust end date if it's before new start date
                            const newEndDate = new Date(date);
                            newEndDate.setDate(newEndDate.getDate() + 7); // Default to 1 week after
                            setDateRangeEnd(newEndDate);
                          }
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        return date < today;
                      }}
                      initialFocus
                      className="bg-gray-900 text-white [&_button]:text-white [&_button:hover]:bg-gray-800 [&_button[aria-selected]]:bg-blue-600"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
                  End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-750 text-white",
                        !dateRangeEnd && "text-gray-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-gray-400" />
                      {dateRangeEnd ? format(dateRangeEnd, "PPP") : <span>Pick an end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700 text-white" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRangeEnd}
                      onSelect={(date) => {
                         if(date) {
                          date.setHours(23,59,59,999); // Ensure end date covers the whole day
                          setDateRangeEnd(date);
                         }
                      }}
                      disabled={(date) =>
                        dateRangeStart ? date < dateRangeStart : false // Can't be before start date
                      }
                      initialFocus
                      className="bg-gray-900 text-white [&_button]:text-white [&_button:hover]:bg-gray-800 [&_button[aria-selected]]:bg-blue-600"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Removed the "View Slots" button as slots fetch automatically */}
            </div>

            {bookingError && <Alert variant="destructive" className="bg-red-900 border-red-700 !text-white"><AlertDescription className="!text-white">{bookingError}</AlertDescription></Alert>}
            {bookingSuccess && <Alert variant="default" className="bg-green-800 border-green-700 text-green-200"><AlertDescription>{bookingSuccess}</AlertDescription></Alert>}
            
            {isFetchingSlots && <p className="text-center text-gray-400 py-3">Fetching available slots...</p>}

            {!isFetchingSlots && availabilities.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="font-semibold text-lg text-white">Available Slots:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {displaySlots.map(avail => (
                    <li key={`${avail.availabilityId}-${avail.startTime}`}>
                      <Button
                        variant={
                          selectedAvailability?.availabilityId === avail.availabilityId &&
                          selectedAvailability?.startTime === avail.startTime
                          ? "default" // Primary selected style
                          : "outline" // Secondary unselected style
                        }
                        className={cn(
                          "w-full text-left justify-start h-auto py-3 px-3 transition-all min-h-[4rem]",
                          selectedAvailability?.availabilityId === avail.availabilityId && selectedAvailability?.startTime === avail.startTime
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-transparent"
                            : "bg-gray-800 border-gray-700 hover:bg-gray-750 text-gray-300 hover:text-white"
                        )}
                        onClick={() => setSelectedAvailability(avail)}
                      >
                        <div className="flex flex-col">
                          {avail.isRecurring ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {avail.recurringDay ? avail.recurringDay.charAt(0).toUpperCase() + avail.recurringDay.slice(1).toLowerCase() : 'Daily'}
                                </span>
                                <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">
                                  Recurring
                                </span>
                              </div>
                              <span className="text-sm">
                                {`${format(new Date(avail.startTime), "p")} - ${format(new Date(avail.endTime), "p")}`}
                              </span>
                              {avail.recurrenceEndDate && (
                                <span className="text-xs text-gray-400">
                                  Until {format(new Date(avail.recurrenceEndDate), "PPP")}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="font-medium">{format(new Date(avail.startTime), "PPP")}</span>
                              <span className="text-sm">{`${format(new Date(avail.startTime), "p")} - ${format(new Date(avail.endTime), "p")}`}</span>
                            </>
                          )}
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!isFetchingSlots && availabilities.length === 0 && !bookingError && dateRangeStart && dateRangeEnd && (
               <p className="text-center text-gray-500 py-3">No slots available for the selected criteria. Try adjusting the dates.</p>
            )}


            {selectedAvailability && (
              <div className="mt-6 pt-6 border-t border-gray-800 space-y-4">
                <h4 className="text-lg font-semibold text-white">Confirm Booking Details:</h4>
                <div>
                  <Label htmlFor="topic" className="text-gray-300">Topic</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Algebra Basics, React Hooks"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what you want to learn or discuss."
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                  />
                </div>
                <Button
                  onClick={handleBookSession}
                  disabled={isLoading || !selectedAvailability}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-base"
                >
                  {isLoading ? 'Booking...' : 'Confirm & Book Session'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Show message for guest users and admins */}
      {(!currentUser || currentUser.role === 'Admin') && (
        <Card className="bg-gray-900 border-gray-800 shadow-xl">
          <CardContent className="p-6 text-center">
            <p className="text-gray-300 text-lg mb-4">
              {!currentUser ? (
                <>Please <a href="/login" className="text-blue-400 hover:text-blue-300 underline">log in</a> to book a session with this tutor.</>
              ) : (
                <>Admins cannot book sessions with tutors.</>
              )}
            </p>
            <p className="text-gray-500 text-sm">
              {!currentUser ? (
                <>You need to be authenticated to view availability and make bookings.</>
              ) : (
                <>Only students and tutors can book tutoring sessions.</>
              )}
            </p>
          </CardContent>
        </Card>
      )}


    </div>
  );
};

export default TutorDetailPage;
