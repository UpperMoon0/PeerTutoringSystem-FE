import React, { useState } from 'react';
import type { Booking } from '@/types/booking.types';
import type { Session } from '@/types/session.types';
import { BookingService } from '@/services/BookingService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarDays, Clock, User, Tag, FileText, AlertCircle, XCircle, CheckCircle2, ListChecks, Video, MessageCircle, Timer } from 'lucide-react';
import { format, isAfter, differenceInHours, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';

interface BookingWithSession extends Booking {
  session?: Session;
}

interface BookingDetailModalProps {
  booking: BookingWithSession | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingCancelled: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, isOpen, onClose, onBookingCancelled }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!booking) return null;

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Confirmed': return 'default';
      case 'Cancelled':
      case 'Rejected': return 'destructive';
      case 'Completed': return 'outline';
      default: return 'secondary';
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    setIsCancelling(true);
    setError(null);
    try {
      const result = await BookingService.updateBookingStatus(booking.bookingId, 'Cancelled');
      if (result.success) {
        onBookingCancelled(); // This will close modal & refresh list via parent
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : (result.error as any)?.message || "Failed to cancel booking.";
        setError(errorMessage);
        toast.error(`Cancellation failed: ${errorMessage}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred during cancellation.";
      setError(errorMessage);
      toast.error(`Cancellation error: ${errorMessage}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleContactTutor = () => {
    toast.info(`Contact feature for ${booking.tutorName} would open here.`);
  };

  const handleJoinSession = () => {
    const bookingWithSession = booking as BookingWithSession;
    if (bookingWithSession.session?.videoCallLink) {
      window.open(bookingWithSession.session.videoCallLink, '_blank');
      toast.success(`Opening session for ${booking.topic}`);
    } else {
      toast.info(`Session link for ${booking.topic} is not yet available. Please contact your tutor.`);
    }
  };

  const getTimeUntilSession = (sessionStartTime: string): string => {
    const now = new Date();
    const sessionDate = new Date(sessionStartTime);
    
    const hours = differenceInHours(sessionDate, now);
    const minutes = differenceInMinutes(sessionDate, now) % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}, ${hours % 24} hour${(hours % 24) !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return 'Starting now';
    }
  };

  const isSessionUpcoming = booking.status === 'Confirmed' && isAfter(new Date(booking.startTime), new Date());
  const isSessionCompleted = booking.status === 'Completed';
  const hasSessionInfo = booking.status === 'Confirmed' || booking.status === 'Completed';
  
  const canCancel = booking.status === 'Pending' || booking.status === 'Confirmed'; // Assuming Confirmed can also be cancelled by student

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center">
            <ListChecks className="w-6 h-6 mr-2 text-blue-400" />
            Booking Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Comprehensive details of your tutoring session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="font-semibold text-gray-300 mb-1 flex items-center"><User className="w-4 h-4 mr-1.5 text-gray-500" /> Tutor:</h3>
              <p className="text-white">{booking.tutorName || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-300 mb-1 flex items-center"><Tag className="w-4 h-4 mr-1.5 text-gray-500" /> Topic/Skill:</h3>
              <p className="text-white">{booking.topic}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-300 mb-1 flex items-center"><CalendarDays className="w-4 h-4 mr-1.5 text-gray-500" /> Date:</h3>
            <p className="text-white">{format(new Date(booking.sessionDate || booking.startTime), 'EEEE, MMMM dd, yyyy')}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-300 mb-1 flex items-center"><Clock className="w-4 h-4 mr-1.5 text-gray-500" /> Time:</h3>
            <p className="text-white">
              {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-300 mb-1 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-gray-500" /> Status:</h3>
            <div className="space-y-2">
              <Badge variant={getStatusBadgeVariant(booking.status)} className="text-sm capitalize">
                {booking.status}
              </Badge>
              {isSessionUpcoming && (
                <div className="text-sm text-blue-400">
                  <Timer className="w-4 h-4 inline mr-1" />
                  Starts in: {getTimeUntilSession(booking.startTime)}
                </div>
              )}
              {isSessionCompleted && (
                <div className="text-sm text-green-400">
                  Session completed on {format(new Date(booking.endTime), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          </div>

          {booking.description && (
            <div>
              <h3 className="font-semibold text-gray-300 mb-1 flex items-center"><FileText className="w-4 h-4 mr-1.5 text-gray-500" /> Description/Notes:</h3>
              <p className="text-gray-300 bg-gray-800 p-3 rounded-md whitespace-pre-wrap">
                {booking.description}
              </p>
            </div>
          )}

          {hasSessionInfo && (
            <div className="border-t border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-300 mb-3 flex items-center">
                <Video className="w-4 h-4 mr-1.5 text-blue-400" />
                Session Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Duration</h4>
                  <p className="text-white">
                    {Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60))} minutes
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Session Type</h4>
                  <p className="text-white">Online Tutoring</p>
                </div>
                {booking.tutorName && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Tutor Contact</h4>
                    <p className="text-white">{booking.tutorName}</p>
                  </div>
                )}
                {isSessionUpcoming && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Session Access</h4>
                    <p className="text-sm text-blue-400">
                      {(booking as BookingWithSession).session?.videoCallLink
                        ? 'Ready to join'
                        : 'Link pending from tutor'}
                    </p>
                  </div>
                )}
              </div>
              
              {(booking as BookingWithSession).session?.sessionNotes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Session Preparation Notes</h4>
                  <p className="text-gray-300 bg-gray-800 p-3 rounded-md whitespace-pre-wrap">
                    {(booking as BookingWithSession).session?.sessionNotes}
                  </p>
                </div>
              )}
              
              {(booking as BookingWithSession).session?.videoCallLink && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Meeting Link</h4>
                  <div className="flex items-center space-x-2">
                    <p className="text-blue-400 text-sm break-all">
                      {(booking as BookingWithSession).session?.videoCallLink}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {booking.skillId && (
             <div>
                <h3 className="font-semibold text-gray-300 mb-1">Skill ID:</h3>
                <p className="text-white">{booking.skillId}</p>
            </div>
          )}
           <div>
                <h3 className="font-semibold text-gray-300 mb-1">Booking ID:</h3>
                <p className="text-xs text-gray-500">{booking.bookingId}</p>
            </div>
        </div>
        
        <DialogFooter className="mt-2 pt-4 border-t border-gray-800 gap-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              Close
            </Button>
            
            {isSessionUpcoming && (
              <>
                <Button
                  variant="default"
                  onClick={handleJoinSession}
                  className={`${(booking as BookingWithSession).session?.videoCallLink
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                  disabled={!(booking as BookingWithSession).session?.videoCallLink}
                >
                  <Video className="w-4 h-4 mr-2" />
                  {(booking as BookingWithSession).session?.videoCallLink ? 'Join Session' : 'Link Pending'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleContactTutor}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Tutor
                </Button>
              </>
            )}
            
            {canCancel && (
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};