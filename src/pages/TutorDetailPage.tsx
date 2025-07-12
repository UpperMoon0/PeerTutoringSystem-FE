import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookingService } from '@/services/BookingService';
import { TutorService } from '@/services/TutorService';
import { UserSkillService } from '@/services/UserSkillService';
import { ReviewService } from '@/services/ReviewService';
import type { ProfileDto, User } from '@/types/user.types';
import type { Skill, UserSkill } from '@/types/skill.types';
import type { TutorAvailability } from '@/types/tutorAvailability.types';
import type { CreateBookingDto, Booking } from '@/types/booking.types';
import type { ReviewDto } from '@/types/review.types';
import { BookingDetailModal } from '@/components/booking/BookingDetailModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, MessageCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, generateGradient, getInitials } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/ui/StarRating';
import ReviewList from '@/components/reviews/ReviewList';

type TutorProfile = ProfileDto;

const TutorDetailPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate(); 
  const { currentUser } = useAuth();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [tutorAccount] = useState<User | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availabilities, setAvailabilities] = useState<TutorAvailability[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<TutorAvailability | null>(null);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [rating, setRating] = useState<{ averageRating: number; reviewCount: number }>({ averageRating: 0, reviewCount: 0 });
  const [ratingLoading, setRatingLoading] = useState<boolean>(true);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>(undefined);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [newlyCreatedBooking, setNewlyCreatedBooking] = useState<Booking | null>(null);


  const getProcessedAvailabilities = useCallback((slotsToProcess: TutorAvailability[]): TutorAvailability[] => {
    interface RecurringGroup {
      slots: TutorAvailability[];
      minDate: Date;
      maxDate: Date; 
      originalRecurrenceEndDate?: Date | null;
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
  }, []);

  const displaySlots = useMemo(() => {
    const unbookedSlots = availabilities.filter(slot => !slot.isBooked);
    return getProcessedAvailabilities(unbookedSlots);
  }, [availabilities, getProcessedAvailabilities]);

  const enrichedTutor = useMemo(() => {
    if (!tutor) return null;
    return {
      ...tutor,
      bio: tutor.bio || '',
      experience: tutor.experience || '',
      hourlyRate: tutor.hourlyRate ?? 0,
      availability: tutor.availability || '',
      averageRating: rating.averageRating,
      reviewCount: rating.reviewCount,
      skills: userSkills,
    };
  }, [tutor, rating, skills]);

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
          const tutorUserSkills = skillsResponse.data.filter((userSkill: UserSkill) => userSkill.isTutor);
          setUserSkills(tutorUserSkills);
          // Extract the Skill objects from UserSkill objects
          const tutorSkills = tutorUserSkills.map((userSkill: UserSkill) => userSkill.skill);
          setSkills(tutorSkills);
        } else {
          console.warn('Failed to fetch tutor skills:', skillsResponse.error);
          setSkills([]);
          setUserSkills([]);
        }
      } catch (err) {
        console.warn('Error fetching tutor skills:', err);
        setSkills([]);
        setUserSkills([]);
      }
    };
    
    fetchTutorSkills();
  }, [tutorId]);

  // Fetch tutor rating and reviews
  useEffect(() => {
    const fetchTutorRatingAndReviews = async () => {
      if (!tutorId) {
        setRating({ averageRating: 0, reviewCount: 0 });
        setReviews([]);
        setRatingLoading(false);
        setReviewsLoading(false);
        return;
      }
      
      setRatingLoading(true);
      setReviewsLoading(true);
      setReviewsError(null);
      
      try {
        const [avgRatingResult, reviewsResult] = await Promise.all([
          ReviewService.getAverageRatingByTutorId(tutorId),
          ReviewService.getReviewsByTutorId(tutorId)
        ]);

        const averageRating = avgRatingResult.success && avgRatingResult.data ? avgRatingResult.data.averageRating : 0;
        
        if (reviewsResult.success && reviewsResult.data) {
          setReviews(reviewsResult.data);
          setRating({ averageRating, reviewCount: reviewsResult.data.length });
        } else {
          setReviews([]);
          setRating({ averageRating, reviewCount: 0 });
          setReviewsError(reviewsResult.error as string || 'Failed to fetch reviews.');
        }
      } catch (err) {
        console.warn('Error fetching tutor rating and reviews:', err);
        setRating({ averageRating: 0, reviewCount: 0 });
        setReviews([]);
        setReviewsError(err instanceof Error ? err.message : 'An error occurred while fetching reviews.');
      } finally {
        setRatingLoading(false);
        setReviewsLoading(false);
      }
    };
    
    fetchTutorRatingAndReviews();
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
    if (!selectedSkillId) {
      setBookingError('Please select a skill for the session.');
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
        setNewlyCreatedBooking(response.data);
        setIsBookingModalOpen(true);
        setBookingSuccess(`Booking confirmed for ${new Date(selectedAvailability.startTime).toLocaleString()}!`);
        setSelectedAvailability(null);
        setTopic('');
        setDescription('');
        setSelectedSkillId(undefined);
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

  if (isLoading && !tutor) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6"><p>Loading tutor profile...</p></div>;
  if (error) return <div className="min-h-screen bg-background text-foreground p-6"><Alert variant="destructive" className="bg-destructive border-destructive text-destructive-foreground"><AlertDescription>{error}</AlertDescription></Alert></div>;
  if (!tutor) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6"><p>Tutor not found.</p></div>;

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setNewlyCreatedBooking(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
      <Card className="bg-card border-border shadow-xl">
        <CardHeader className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 p-6">
          <Avatar className="h-28 w-28 border-2 border-accent">
            <AvatarImage src={tutor.avatarUrl} alt={tutor.fullName || "Tutor avatar"} />
            <AvatarFallback
              className={`bg-gradient-to-br ${generateGradient(tutor.fullName)} text-primary-foreground text-4xl font-bold`}
            >
              {getInitials(tutor.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <CardTitle className="text-3xl text-foreground">{tutor.fullName || "Tutor"}</CardTitle>
            {tutorAccount && tutorAccount.email && <CardDescription className="text-muted-foreground">Email: {tutorAccount.email}</CardDescription>}
            {tutor.school && <CardDescription className="text-muted-foreground">School: {tutor.school}</CardDescription>}
            
            {/* Rating Section */}
            <div className="mt-3">
              {ratingLoading ? (
                <p className="text-sm text-muted-foreground">Loading rating...</p>
              ) : (
                <StarRating
                  rating={rating.averageRating}
                  reviewCount={rating.reviewCount}
                  size="md"
                  className="justify-center md:justify-start"
                />
              )}
            </div>
            {currentUser && currentUser.userId !== tutorId && (
              <Button
                onClick={() => navigate(`/student/chat?userId=${tutorId}`)}
                variant="outline"
                size="sm"
                className="bg-primary hover:bg-ring text-primary-foreground ml-auto mt-4"
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {tutor.bio && <p className="text-muted-foreground"><strong className="text-foreground">Bio:</strong> {tutor.bio}</p>}
          {tutor.hourlyRate !== undefined && <p className="text-muted-foreground"><strong className="text-foreground">Hourly Rate:</strong> ${tutor.hourlyRate.toFixed(2)}</p>}
          {tutor.experience && <p className="text-muted-foreground"><strong className="text-foreground">Experience:</strong> {tutor.experience}</p>}
          {tutor.availability && <p className="text-muted-foreground mb-3"><strong className="text-foreground">General Availability:</strong> {tutor.availability}</p>}
          
          <h3 className="text-xl font-semibold text-foreground pt-3 border-t border-border">Skills</h3>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill.skillID} variant="secondary" className="bg-secondary text-primary hover:bg-accent text-sm px-3 py-1">{skill.skillName}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No skills listed for this tutor.</p>
          )}
        </CardContent>
      </Card>

      {/* Only show booking section for authenticated users who are not admins */}
      {currentUser && currentUser.role !== 'Admin' && (
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-2xl text-foreground">Book a Session</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="startDate" className="block text-sm font-medium text-muted-foreground">
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-input border-border hover:bg-accent text-foreground",
                        !dateRangeStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
                      {dateRangeStart ? format(dateRangeStart, "PPP") : <span>Pick a start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border text-popover-foreground" align="start">
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
                      className="bg-popover text-popover-foreground [&_button]:text-popover-foreground [&_button:hover]:bg-accent [&_button[aria-selected]]:bg-primary"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="endDate" className="block text-sm font-medium text-muted-foreground">
                  End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-input border-border hover:bg-accent text-foreground",
                        !dateRangeEnd && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
                      {dateRangeEnd ? format(dateRangeEnd, "PPP") : <span>Pick an end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border text-popover-foreground" align="start">
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
                      className="bg-popover text-popover-foreground [&_button]:text-popover-foreground [&_button:hover]:bg-accent [&_button[aria-selected]]:bg-primary"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setDateRangeStart(undefined);
                    setDateRangeEnd(undefined);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Clear
                </Button>
              </div>
            </div>

            {bookingError && <Alert variant="destructive" className="bg-destructive border-destructive !text-primary-foreground"><AlertDescription className="!text-primary-foreground">{bookingError}</AlertDescription></Alert>}
            {bookingSuccess && <Alert variant="default" className="bg-primary border-primary text-primary-foreground"><AlertDescription>{bookingSuccess}</AlertDescription></Alert>}
            
            {isFetchingSlots && <p className="text-center text-muted-foreground py-3">Fetching available slots...</p>}

            {!isFetchingSlots && availabilities.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="font-semibold text-lg text-foreground">Available Slots:</h4>
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
                          ? "bg-gradient-to-r from-primary to-ring hover:from-ring hover:to-ring text-primary-foreground border-transparent"
                          : "bg-input border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => {
                          if (selectedAvailability?.availabilityId === avail.availabilityId && selectedAvailability?.startTime === avail.startTime) {
                            setSelectedAvailability(null); // Deselect if already selected
                          } else {
                            setSelectedAvailability(avail); // Select new slot
                          }
                        }}
                      >
                        <div className="flex flex-col">
                          {avail.isRecurring ? (
                            <>
                               <div className="flex items-center gap-2">
                                 <span className="font-medium">
                                   {avail.recurringDay ? avail.recurringDay.charAt(0).toUpperCase() + avail.recurringDay.slice(1).toLowerCase() : 'Daily'}
                                 </span>
                                 <span className="text-xs bg-primary/20 text-primary-foreground px-2 py-0.5 rounded-full">
                                   Recurring
                                 </span>
                               </div>
                               <span className="text-sm">
                                 {`${format(new Date(avail.startTime), "p")} - ${format(new Date(avail.endTime), "p")}`}
                               </span>
                               {avail.recurrenceEndDate && (
                                 <span className="text-xs text-muted-foreground">
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
               <p className="text-center text-muted-foreground py-3">No slots available for the selected criteria. Try adjusting the dates.</p>
            )}


            {selectedAvailability && (
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Confirm Booking Details:</h4>
                <div>
                  <Label htmlFor="skill" className="text-muted-foreground">
                    Skill
                  </Label>
                  <Select
                    value={selectedSkillId}
                    onValueChange={(value) => {
                      const skill = skills.find((s) => s.skillID === value);
                      if (skill) {
                        setSelectedSkillId(skill.skillID);
                        setTopic(skill.skillName);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring">
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((skill) => (
                        <SelectItem key={skill.skillID} value={skill.skillID}>
                          {skill.skillName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description" className="text-muted-foreground">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what you want to learn or discuss."
                    className="bg-input border-border text-foreground placeholder-muted-foreground focus:ring-ring focus:border-ring min-h-[100px]"
                  />
                </div>
                <Button
                  onClick={handleBookSession}
                  disabled={isLoading || !selectedAvailability}
                  className="w-full bg-gradient-to-r from-primary to-ring hover:from-ring hover:to-ring text-primary-foreground font-semibold py-3 text-base"
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
        <Card className="bg-card border-border shadow-xl">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground text-lg mb-4">
              {!currentUser ? (
                <>Please <a href="/login" className="text-primary hover:text-primary/80 underline">log in</a> to book a session with this tutor.</>
              ) : (
                <>Admins cannot book sessions with tutors.</>
              )}
            </p>
            <p className="text-muted-foreground text-sm">
              {!currentUser ? (
                <>You need to be authenticated to view availability and make bookings.</>
              ) : (
                <>Only students and tutors can book tutoring sessions.</>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews Section */}
      <Card className="bg-card border-border shadow-xl">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl text-foreground">Reviews</CardTitle>
          <CardDescription className="text-muted-foreground">
            See what students are saying about this tutor
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ReviewList
            reviews={reviews}
            isLoading={reviewsLoading}
            error={reviewsError}
          />
        </CardContent>
      </Card>

      {newlyCreatedBooking && (
      <BookingDetailModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseModal}
        booking={newlyCreatedBooking}
        onBookingCancelled={() => {
          handleCloseModal();
          handleFetchAvailabilities();
        }}
        userRole="student"
        tutorDetails={enrichedTutor}
      />
      )}
    </div>
  );
};

export default TutorDetailPage;
