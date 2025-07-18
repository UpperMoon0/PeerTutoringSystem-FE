import React, { useState } from 'react';
import type { Booking } from '@/types/booking.types';
import type { Session, CreateSessionDto, UpdateSessionDto } from '@/types/session.types';
import { BookingService } from '@/services/BookingService';
import { SessionService } from '@/services/SessionService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ListChecks, CalendarDays, Clock, User, Tag, FileText, CheckCircle2, Video, MessageCircle, Timer, ExternalLink, Pencil } from 'lucide-react';
import { format, isAfter, differenceInHours, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import SessionForm from '@/components/session/SessionForm';

interface BookingWithSession extends Booking {
  session?: Session;
}

interface BookingDetailModalProps {
  booking: BookingWithSession | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingCancelled: () => void;
  userRole?: 'student' | 'tutor' | 'admin';
  onUpdateStatus?: (status: string) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  onBookingCancelled,
  userRole = 'student',
  onUpdateStatus
}) => {
  const { currentUser } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<BookingWithSession | null>(booking);
  const [currentSession, setCurrentSession] = useState<Session | undefined>(booking?.session);
  const [isSubmittingSessionUpdate, setIsSubmittingSessionUpdate] = useState(false);

  // Update internal state when the `booking` prop changes
  React.useEffect(() => {
    setCurrentBooking(booking);
    setCurrentSession(booking?.session);
  }, [booking]);

  // Reset isEditingSession when the modal is opened or the booking prop changes, ensuring a clean state
  React.useEffect(() => {
    if (isOpen || booking) { // Trigger reset if modal opens or booking changes
      setIsEditingSession(false);
    }
  }, [isOpen, booking]);

  if (!booking) return null;

  const handleUpdateSession = async (sessionData: UpdateSessionDto) => {
    setIsSubmittingSessionUpdate(true);
    try {
      const result = await SessionService.updateSession(sessionData.sessionId, sessionData);

      if (result.success && result.data) {
        toast.success('Session updated successfully');
        setCurrentSession(result.data);
        if (currentBooking) {
          setCurrentBooking({
            ...currentBooking,
            session: result.data
          });
        }
        setIsEditingSession(false);
      } else {
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || 'Failed to update session';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
    } finally {
      setIsSubmittingSessionUpdate(false);
    }
  };

  const handleCreateSession = async (sessionData: CreateSessionDto) => {
    if (!booking) return;

    setError(null);
    try {
      const result = await SessionService.createSession(sessionData);
      if (result.success && result.data) {
        setCurrentSession(result.data);
        setCurrentBooking(prev => prev ? { ...prev, session: result.data } : null);
        toast.success('Session created successfully!');
        onUpdateStatus?.('Confirmed'); // Assuming creating a session implies confirming the booking
        onClose(); // Close modal after successful creation
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : (result.error as { message?: string })?.message || 'Failed to create session.';
        setError(errorMessage);
        toast.error(`Session creation failed: ${errorMessage}`);
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || "An unexpected error occurred during session creation.";
      setError(errorMessage);
      toast.error(`Session creation error: ${errorMessage}`);
    }
  };

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

  const handleJoinSession = () => {
    if (currentSession?.videoCallLink) {
      window.open(currentSession.videoCallLink, '_blank');
      toast.success(`Opening session for ${booking.topic}`);
    } else {
      toast.info(`Session link for ${booking.topic} is not yet available. Please contact your ${userRole === 'student' ? 'tutor' : 'student'}.`);
    }
  };

  const handleContactUser = () => {
    const contactName = userRole === 'student' ? booking.tutorName : booking.studentName;
    toast.info(`Contact feature for ${contactName} would open here.`);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!booking) return;

    setIsCancelling(true);
    setError(null);
    try {
      const result = await BookingService.updateBookingStatus(booking.bookingId, status);
      if (result.success) {
        if (status === 'Cancelled') {
          onBookingCancelled(); // This will close modal & refresh list via parent
        } else if (status === 'Confirmed') {
          // Automatically create session upon confirmation
          const sessionData: CreateSessionDto = {
            bookingId: booking.bookingId,
            videoCallLink: `https://meet.google.com/${booking.bookingId.substring(0, 10)}`, // Placeholder
            sessionNotes: `Session for booking ${booking.bookingId} on topic: ${booking.topic}.`, // Placeholder
            startTime: booking.startTime,
            endTime: booking.endTime,
          };
          await handleCreateSession(sessionData);
        } else {
          onUpdateStatus?.(status);
          onClose(); // Close modal after successful update for other statuses
        }
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : (result.error as { message?: string })?.message || `Failed to update booking to ${status}.`;
        setError(errorMessage);
        toast.error(`Update failed: ${errorMessage}`);
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || "An unexpected error occurred during update.";
      setError(errorMessage);
      toast.error(`Update error: ${errorMessage}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const isCurrentUserTutor = currentUser?.userId === booking.tutorId;
  const isSessionUpcoming = booking.status === 'Confirmed' && isAfter(new Date(booking.startTime), new Date());
  const isSessionCompleted = booking.status === 'Completed';
  const hasSessionInfo = (booking.status === 'Confirmed' || booking.status === 'Completed') && currentSession;
  const canEditSession = isCurrentUserTutor && hasSessionInfo && currentSession;
  const canAcceptReject = isCurrentUserTutor && booking.status === 'Pending';
  const canComplete = isCurrentUserTutor && booking.status === 'Confirmed' && new Date(booking.endTime) < new Date();
  const showCompleteButton = isCurrentUserTutor && booking.status === 'Confirmed';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl flex items-center">
            <ListChecks className="w-6 h-6 mr-2 text-primary" />
            Booking Details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Comprehensive details of your tutoring session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h3 className="font-semibold text-muted-foreground mb-1 flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-muted-foreground" />
                  {userRole === 'student' ? 'Tutor:' : 'Student:'}
                </h3>
                <p className="text-foreground">
                  {userRole === 'student' ? booking.tutorName || 'N/A' : booking.studentName || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground mb-1 flex items-center">
                  <Tag className="w-4 h-4 mr-1.5 text-muted-foreground" /> Topic/Skill:
                </h3>
                <p className="text-foreground">{booking.topic}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-muted-foreground mb-1 flex items-center">
                <CalendarDays className="w-4 h-4 mr-1.5 text-muted-foreground" /> Date:
              </h3>
              <p className="text-foreground">{format(new Date(booking.sessionDate || booking.startTime), 'EEEE, MMMM dd, yyyy')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-muted-foreground mb-1 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-muted-foreground" /> Time:
              </h3>
              <p className="text-foreground">
                {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-muted-foreground mb-1 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-muted-foreground" /> Status:
              </h3>
              <div className="space-y-2">
                <Badge variant={getStatusBadgeVariant(booking.status)} className="text-sm capitalize">
                  {booking.status}
                </Badge>
                {isSessionUpcoming && (
                  <div className="text-sm text-primary">
                    <Timer className="w-4 h-4 inline mr-1" />
                    Starts in: {getTimeUntilSession(booking.startTime)}
                  </div>
                )}
                {isSessionCompleted && (
                  <div className="text-sm text-primary">
                    Session completed on {format(new Date(booking.endTime), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            </div>

            {booking.description && (
              <div>
                <h3 className="font-semibold text-muted-foreground mb-1 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-muted-foreground" /> Description/Notes:
                </h3>
                <p className="text-muted-foreground bg-input p-3 rounded-md whitespace-pre-wrap">
                  {booking.description}
                </p>
              </div>
            )}

            {hasSessionInfo ? (
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-muted-foreground flex items-center">
                    <Video className="w-4 h-4 mr-1.5 text-primary" />
                    Session Information
                  </h3>
                  {canEditSession && !isEditingSession && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:bg-muted"
                      onClick={() => setIsEditingSession(true)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Session
                    </Button>
                  )}
                </div>
                {isEditingSession && canEditSession ? (
                  <SessionForm
                    booking={booking}
                    session={currentSession}
                    onSubmit={handleUpdateSession as (data: CreateSessionDto | UpdateSessionDto) => Promise<void>}
                    isSubmitting={isSubmittingSessionUpdate}
                    error={error || undefined}
                    onCancel={() => setIsEditingSession(false)}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                        <p className="text-foreground">
                          {Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60))} minutes
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Session Type</h4>
                        <p className="text-foreground">Online Tutoring</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          {userRole === 'student' ? 'Tutor Contact' : 'Student Contact'}
                        </h4>
                        <p className="text-foreground">
                          {userRole === 'student' ? booking.tutorName : booking.studentName}
                        </p>
                      </div>
                      {isSessionUpcoming && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Session Access</h4>
                          <p className="text-sm text-primary">
                            {currentSession?.videoCallLink
                              ? 'Ready to join'
                              : 'Link pending from tutor'}
                          </p>
                        </div>
                      )}
                    </div>
                    {currentSession?.sessionNotes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Session Preparation Notes</h4>
                        <p className="text-muted-foreground bg-input p-3 rounded-md whitespace-pre-wrap">
                          {currentSession.sessionNotes}
                        </p>
                      </div>
                    )}
                    {currentSession?.videoCallLink && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Meeting Link</h4>
                        <div className="flex items-center space-x-2">
                          <p className="text-primary text-sm break-all">
                            {currentSession.videoCallLink}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(currentSession?.videoCallLink, '_blank')}
                            className="text-primary hover:text-primary-foreground"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="border-t border-border pt-4 text-center text-muted-foreground">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-warning" />
                <p className="text-lg font-semibold">No session created yet</p>
                <p className="text-sm">The tutor needs to create a session for this booking.</p>
              </div>
            )}

 
             {booking.skillId && (
               <div>
                 <h3 className="font-semibold text-muted-foreground mb-1">Skill ID:</h3>
                 <p className="text-foreground">{booking.skillId}</p>
               </div>
             )}
             
             <div>
               <h3 className="font-semibold text-muted-foreground mb-1">Booking ID:</h3>
               <p className="text-xs text-muted-foreground">{booking.bookingId}</p>
             </div>
 
             <div className="border-t border-border pt-4">
               <div className="flex flex-wrap gap-2">
                 {isSessionUpcoming && (
                   <>
                     <Button
                       variant="default"
                       onClick={handleJoinSession}
                       className={`${currentSession?.videoCallLink
                         ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                         : 'bg-muted text-muted-foreground cursor-not-allowed'} `}
                       disabled={!currentSession?.videoCallLink}
                     >
                       <Video className="w-4 h-4 mr-2" />
                       {currentSession?.videoCallLink ? 'Join Session' : 'Link Pending'}
                     </Button>
                     <Button
                       variant="outline"
                       onClick={handleContactUser}
                       className="border-border text-muted-foreground hover:bg-muted"
                     >
                       <MessageCircle className="w-4 h-4 mr-2" />
                       Contact {userRole === 'student' ? 'Tutor' : 'Student'}
                     </Button>
                   </>
                 )}
                 
                 {canAcceptReject && (
                   <>
                     <Button
                       onClick={() => handleUpdateStatus('Confirmed')}
                       disabled={isCancelling}
                       className="bg-primary text-primary-foreground hover:bg-primary/90"
                     >
                       <CheckCircle2 className="w-4 h-4 mr-2" />
                       {isCancelling ? 'Processing...' : 'Accept Booking'}
                     </Button>
                     <Button
                       onClick={() => handleUpdateStatus('Rejected')}
                       disabled={isCancelling}
                       variant="destructive"
                     >
                       {isCancelling ? 'Rejecting...' : 'Reject Booking'}
                     </Button>
                   </>
                 )}
 
                 {showCompleteButton && (
                   <Button
                     onClick={() => handleUpdateStatus('Completed')}
                     disabled={isCancelling || !canComplete}
                     className={`${canComplete
                       ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                       : 'bg-muted text-muted-foreground cursor-not-allowed'} `}
                   >
                     <CheckCircle2 className="w-4 h-4 mr-2" />
                     {isCancelling ? 'Completing...' : canComplete ? 'Mark as Completed' : 'Session Not Ended'}
                   </Button>
                 )}
                 
               </div>
             </div>
           </div>
         </div>
         
         {(!isEditingSession) && (
           <DialogFooter className="mt-2 pt-4 border-t border-border">
             <Button
               variant="outline"
               onClick={onClose}
               className="bg-muted hover:bg-accent border-border"
             >
               Close
             </Button>
           </DialogFooter>
         )}
      </DialogContent>
    </Dialog>
  );
};