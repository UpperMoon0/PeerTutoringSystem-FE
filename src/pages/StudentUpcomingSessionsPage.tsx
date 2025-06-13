import React, { useEffect, useState, useCallback } from 'react';
import { BookingService } from '@/services/BookingService';
import { SessionService } from '@/services/SessionService';
import type { Booking } from '@/types/booking.types';
import type { Session } from '@/types/session.types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookingDetailModal } from '@/components/booking/BookingDetailModal';
import {
  CalendarDays,
  Clock,
  User,
  Eye,
  AlertCircle,
  CalendarClock,
  Timer,
  ExternalLink,
  MessageCircle,
  Video
} from 'lucide-react';
import { format, isAfter, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';

interface BookingWithSession extends Booking {
  session?: Session;
}

const StudentUpcomingSessionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<BookingWithSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedBooking, setSelectedBooking] = useState<BookingWithSession | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchUpcomingSessions = useCallback(async () => {
    if (!currentUser) {
      setError('You must be logged in to view your upcoming sessions.');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch confirmed bookings
      const response = await BookingService.getStudentBookingHistory({
        page: 1,
        pageSize: 100, // Get more to filter on frontend
        status: 'Confirmed'
      });

      if (response.success && response.data) {
        const now = new Date();
        // Filter for future sessions only
        const futureConfirmedBookings = response.data.bookings.filter(booking => {
          const sessionDate = new Date(booking.startTime);
          return isAfter(sessionDate, now);
        });

        // Sort by session date (earliest first)
        futureConfirmedBookings.sort((a, b) => {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });

        // Fetch session details for each booking using the direct endpoint
        const sessionsWithDetails: BookingWithSession[] = await Promise.all(
          futureConfirmedBookings.map(async (booking) => {
            try {
              // Use the direct getSessionByBookingId endpoint
              const sessionResponse = await SessionService.getSessionByBookingId(booking.bookingId);
              if (sessionResponse.success && sessionResponse.data) {
                return {
                  ...booking,
                  session: sessionResponse.data
                };
              }
            } catch (sessionError) {
              console.warn(`Failed to fetch session for booking ${booking.bookingId}:`, sessionError);
            }
            return booking;
          })
        );

        setUpcomingSessions(sessionsWithDetails);
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : (response.error as any)?.message || 'Failed to fetch upcoming sessions.';
        setError(errorMessage);
        setUpcomingSessions([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setUpcomingSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUpcomingSessions();
  }, [fetchUpcomingSessions]);

  const getTimeUntilSession = (sessionStartTime: string): string => {
    const now = new Date();
    const sessionDate = new Date(sessionStartTime);
    
    const days = differenceInDays(sessionDate, now);
    const hours = differenceInHours(sessionDate, now) % 24;
    const minutes = differenceInMinutes(sessionDate, now) % 60;

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  const getTimeUntilBadgeVariant = (sessionStartTime: string): "destructive" | "default" | "secondary" | "outline" => {
    const now = new Date();
    const sessionDate = new Date(sessionStartTime);
    const hoursUntil = differenceInHours(sessionDate, now);

    if (hoursUntil <= 1) return 'destructive'; // Red for sessions starting very soon
    if (hoursUntil <= 24) return 'default'; // Default for sessions within 24 hours
    return 'secondary'; // Secondary for sessions further away
  };

  const handleViewDetails = (booking: BookingWithSession) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedBooking(null);
  };

  const handleBookingCancelled = () => {
    toast.success("Booking cancelled successfully.");
    fetchUpcomingSessions(); // Refresh the list
    handleModalClose();
  };

  const handleContactTutor = (booking: BookingWithSession) => {
    // This could open a chat/messaging interface in a real app
    toast.info(`Contact feature for ${booking.tutorName} would open here.`);
  };

  const handleJoinSession = (booking: BookingWithSession) => {
    if (booking.session?.videoCallLink) {
      // Open the video call link in a new tab
      window.open(booking.session.videoCallLink, '_blank');
      toast.success(`Opening session for ${booking.topic}`);
    } else {
      toast.info(`Session link for ${booking.topic} is not yet available. Please contact your tutor.`);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Please log in to view your upcoming sessions.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <CalendarClock className="w-8 h-8 mr-3 text-blue-400" />
          Upcoming Sessions
        </h1>
        <p className="text-gray-400 mt-1">Your confirmed tutoring sessions scheduled for the future.</p>
      </header>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Timer className="w-5 h-5 mr-2 text-blue-400" />
            Your Scheduled Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-800 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : upcomingSessions.length === 0 ? (
            <div className="text-center py-10">
              <CalendarClock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">No upcoming sessions.</p>
              <p className="text-gray-500 mt-1">
                You don't have any confirmed sessions scheduled for the future.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <Card key={session.bookingId} className="bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{session.topic}</h3>
                          <Badge variant="outline" className="w-fit text-green-400 border-green-400">
                            Confirmed
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center text-gray-300">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Tutor:</span>
                            <span className="ml-1">{session.tutorName || 'N/A'}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-300">
                            <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Date:</span>
                            <span className="ml-1">{format(new Date(session.startTime), 'MMM dd, yyyy')}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-300">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Time:</span>
                            <span className="ml-1">
                              {format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <Timer className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-300 mr-1">Starts in:</span>
                            <Badge variant={getTimeUntilBadgeVariant(session.startTime)} className="text-xs">
                              {getTimeUntilSession(session.startTime)}
                            </Badge>
                          </div>
                        </div>

                        {session.description && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-300">Booking Notes:</span>
                            <p className="text-gray-400 mt-1 line-clamp-2">{session.description}</p>
                          </div>
                        )}

                        {session.session?.sessionNotes && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-300">Session Preparation:</span>
                            <p className="text-gray-400 mt-1 line-clamp-2">{session.session.sessionNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-col lg:gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className={`${session.session?.videoCallLink
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                          onClick={() => handleJoinSession(session)}
                          disabled={!session.session?.videoCallLink}
                        >
                          <Video className="w-4 h-4 mr-1" />
                          {session.session?.videoCallLink ? 'Join Session' : 'Link Pending'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => handleContactTutor(session)}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Contact Tutor
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-gray-700"
                          onClick={() => handleViewDetails(session)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={isDetailModalOpen}
          onClose={handleModalClose}
          onBookingCancelled={handleBookingCancelled}
        />
      )}
    </div>
  );
};

export default StudentUpcomingSessionsPage;