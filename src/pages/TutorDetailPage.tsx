import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookingService } from '@/services/BookingService';
import { TutorService } from '@/services/TutorService';
import { ReviewService } from '@/services/ReviewService'; // Added
import type { ProfileDto, User } from '@/types/user.types';
import type { Skill } from '@/types/skill.types';
import type { TutorAvailability } from '@/types/tutorAvailability.types';
import type { CreateBookingDto } from '@/types/booking.types';
import type { ReviewDto } from '@/types/review.types'; // Added
import ReviewList from '@/components/reviews/ReviewList'; // Added
import SubmitReviewForm from '@/components/reviews/SubmitReviewForm'; // Added
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

interface TutorProfile extends ProfileDto {
}

const TutorDetailPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { currentUser } = useAuth();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [tutorAccount] = useState<User | null>(null);
  const [skills] = useState<Skill[]>([]);
  const [availabilities, setAvailabilities] = useState<TutorAvailability[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<TutorAvailability | null>(null);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedSkillId] = useState<string | undefined>(undefined);

  // Review State
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [exampleBookingIdForReview] = useState<string>("placeholder-booking-id-123");

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
            nonRecurringSlots.push(slot); // Treat as non-recurring if dates are invalid
            continue;
          }

          // Group by day (or 'UNKNOWN_DAY' for daily) and time
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
          // If an originalRecurrenceEndDate is set, assume it's consistent for the group.
          // The first one encountered for the group is used.
          if (slot.recurrenceEndDate && !recurringGroups[timeKey].originalRecurrenceEndDate) {
              recurringGroups[timeKey].originalRecurrenceEndDate = new Date(slot.recurrenceEndDate);
          } else if (slot.recurrenceEndDate && recurringGroups[timeKey].originalRecurrenceEndDate && new Date(slot.recurrenceEndDate).getTime() !== recurringGroups[timeKey].originalRecurrenceEndDate!.getTime()) {
            // If differing original recurrenceEndDates are found within a group, it implies an issue or complex scenario.
            // For simplicity, we might prioritize the one from the earliest slot or clear it to use maxDate.
            // Current logic: first one wins. Or, if we want to be safer:
            // recurringGroups[timeKey].originalRecurrenceEndDate = null; // Force use of maxDate if inconsistent
          }

        } catch (e) {
          // console.error("Error processing recurring slot for grouping:", slot, e);
          nonRecurringSlots.push(slot); // Fallback
        }
      } else {
        nonRecurringSlots.push(slot);
      }
    }

    const finalProcessedSlots: TutorAvailability[] = [...nonRecurringSlots];

    for (const key in recurringGroups) {
      const group = recurringGroups[key];
      if (group.slots.length > 0) {
        // Sort slots in the group by start time to reliably get the first one
        const sortedSlotsInGroup = group.slots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        const firstSlotInGroup = sortedSlotsInGroup[0];

        let displayUntilDate: Date | null = null;
        if (group.originalRecurrenceEndDate) {
          displayUntilDate = group.originalRecurrenceEndDate;
        } else {
          // Use the start date of the latest slot in the fetched series as the "until" date
          displayUntilDate = group.maxDate;
        }
        
        // Create a summary slot based on the first actual slot in the series.
        // Its startTime, endTime, and availabilityId will be from this first slot.
        // The recurrenceEndDate will be overridden for display.
        const summaryDisplaySlot: TutorAvailability = {
          ...firstSlotInGroup,
          // Ensure startTime is the earliest date of this specific recurring event, with its original time.
          startTime: new Date(group.minDate).toISOString(),
          // The endTime should correspond to the minDate as well.
          // Calculate endTime based on minDate and original duration.
          // This is tricky if original startTime/endTime spans midnight.
          // For simplicity, keep firstSlotInGroup.endTime, assuming display logic handles time part correctly.
          // The date part of startTime is already set to group.minDate.
          // The date part of endTime of firstSlotInGroup might not match group.minDate if it's a multi-day event.
          // Let's ensure the summary slot's start and end times are consistent with the first occurrence.
          // The firstSlotInGroup already has the correct startTime and endTime for *an* instance.
          // We just need to ensure its date part is the earliest.
          // The `...firstSlotInGroup` spread already sets startTime and endTime.
          // We then override startTime to be the earliest date.
          // We should also adjust endTime to correspond to that earliest date.
          
          // Let's use the properties of the actual earliest slot.
          // The `startTime` of `firstSlotInGroup` is already the earliest for *that specific instance*.
          // The `group.minDate` is the date of the earliest instance.
          // So, `firstSlotInGroup.startTime` should already be `group.minDate` with the correct time.
          // No, `firstSlotInGroup` is the slot object that has the earliest start time.
          // So `firstSlotInGroup.startTime` IS `group.minDate` (as a string).
          // The `...firstSlotInGroup` is correct.

          recurrenceEndDate: displayUntilDate ? format(displayUntilDate, "yyyy-MM-dd") : null,
        };
        finalProcessedSlots.push(summaryDisplaySlot);
      }
    }

    // Sort the final list by start time for consistent display
    finalProcessedSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return finalProcessedSlots;
  }, [format]); // Added format to dependency array, though it's stable.

  const displaySlots = useMemo(() => {
    const unbookedSlots = availabilities.filter(slot => !slot.isBooked);
    return getProcessedAvailabilities(unbookedSlots);
  }, [availabilities, getProcessedAvailabilities]);

  const fetchTutorReviews = useCallback(async () => {
    if (!tutorId) return;
    setIsLoadingReviews(true);
    setReviewsError(null);
    const result = await ReviewService.getReviewsByTutorId(tutorId);
    if (result.success && result.data) {
      setReviews(result.data);
    } else {
      setReviewsError(result.error as string || 'Failed to fetch reviews.');
    }
    setIsLoadingReviews(false);
  }, [tutorId]);

  useEffect(() => {
    fetchTutorReviews();
  }, [fetchTutorReviews]);

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
    if (tutorId) fetchTutorReviews(); // Fetch reviews when tutorId is available
  }, [tutorId, fetchTutorReviews]); // Added fetchTutorReviews dependency

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
    setIsLoading(true); // Use general loading for booking action

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
            <AvatarImage src={tutor.avatarUrl} alt={tutor.fullName || tutorAccount?.fullName || "Tutor avatar"} />
            <AvatarFallback className="bg-gray-700 text-gray-300 text-4xl">{(tutor.fullName || tutorAccount?.fullName)?.charAt(0) || 'T'}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <CardTitle className="text-3xl text-white">{tutor.fullName || tutorAccount?.fullName || "Tutor"}</CardTitle>
            {tutorAccount && tutorAccount.email && <CardDescription className="text-gray-400">Email: {tutorAccount.email}</CardDescription>}
            {tutor.school && <CardDescription className="text-gray-400">School: {tutor.school}</CardDescription>}
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
            <p className="text-gray-500">No skills listed for this tutor profile. (Note: Skills might be fetched separately)</p>
          )}
        </CardContent>
      </Card>

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

          {bookingError && <Alert variant="destructive" className="bg-red-900 border-red-700 text-red-200"><AlertDescription>{bookingError}</AlertDescription></Alert>}
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
                        "w-full text-left justify-start h-auto py-2.5 px-3 transition-all",
                        selectedAvailability?.availabilityId === avail.availabilityId && selectedAvailability?.startTime === avail.startTime
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-transparent"
                          : "bg-gray-800 border-gray-700 hover:bg-gray-750 text-gray-300 hover:text-white"
                      )}
                      onClick={() => setSelectedAvailability(avail)}
                    >
                      <div className="flex flex-col">
                        {avail.isRecurring ? (
                          <>
                            <span className="font-medium">
                              {`Recurring on ${avail.recurringDay ? avail.recurringDay.charAt(0).toUpperCase() + avail.recurringDay.slice(1).toLowerCase() : 'Daily'}, ${format(new Date(avail.startTime), "HH:mm")} - ${format(new Date(avail.endTime), "HH:mm")}${avail.recurrenceEndDate ? `, until ${format(new Date(avail.recurrenceEndDate), "yyyy-MM-dd")}` : ''}`}
                            </span>
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

      {/* Reviews Section */}
      <Card className="bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl text-white">Tutor Reviews</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <ReviewList reviews={reviews} isLoading={isLoadingReviews} error={reviewsError} />
        </CardContent>
      </Card>

      {/* Submit Review Section - Conditionally render based on if user can review */}
      {/* TODO: Add logic to determine if the currentUser has a completed booking with this tutor
          and hasn't reviewed it yet. For now, showing if logged in and tutorId exists.
          A more robust solution would involve checking past bookings.
      */}
      {currentUser && tutorId && exampleBookingIdForReview && (
        <Card className="bg-gray-900 border-gray-800 shadow-xl">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl text-white">Leave a Review</CardTitle>
            <CardDescription className="text-gray-400">
              Share your experience with {tutor?.fullName || "this tutor"}.
              (Using placeholder booking ID: {exampleBookingIdForReview} for now)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <SubmitReviewForm
              tutorId={tutorId}
              bookingId={exampleBookingIdForReview} // Replace with actual booking ID
              onReviewSubmitted={fetchTutorReviews} // Refresh reviews after submission
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TutorDetailPage;
