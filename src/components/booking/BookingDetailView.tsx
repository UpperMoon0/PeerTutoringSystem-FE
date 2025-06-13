import React, { useState } from 'react';
import type { Booking } from '@/types/booking.types';
import type { Session } from '@/types/session.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, User, Tag, FileText, CheckCircle2, Video, MessageCircle, Timer, ExternalLink } from 'lucide-react';
import { format, isAfter, differenceInHours, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import { EditSessionForm } from '@/components/session/EditSessionForm';

interface BookingDetailViewProps {
  booking: Booking;
  userRole: 'student' | 'tutor';
  onContactUser?: () => void;
  onJoinSession?: () => void;
  onCancelBooking?: () => void;
  onUpdateStatus?: (status: Booking['status']) => void;
  onSessionUpdated?: (updatedSession: Session) => void;
  isUpdating?: boolean;
  showActions?: boolean;
}

export const BookingDetailView: React.FC<BookingDetailViewProps> = ({
  booking,
  userRole,
  onContactUser,
  onJoinSession,
  onCancelBooking,
  onUpdateStatus,
  onSessionUpdated,
  isUpdating = false,
  showActions = true
}) => {
  const [currentSession, setCurrentSession] = useState<Session | undefined>(booking.session);

  const handleSessionUpdated = (updatedSession: Session) => {
    setCurrentSession(updatedSession);
    onSessionUpdated?.(updatedSession);
    toast.success('Session details updated successfully');
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
    onJoinSession?.();
  };

  const handleContactUser = () => {
    const contactName = userRole === 'student' ? booking.tutorName : booking.studentName;
    toast.info(`Contact feature for ${contactName} would open here.`);
    onContactUser?.();
  };

  const isSessionUpcoming = booking.status === 'Confirmed' && isAfter(new Date(booking.startTime), new Date());
  const isSessionCompleted = booking.status === 'Completed';
  const hasSessionInfo = (booking.status === 'Confirmed' || booking.status === 'Completed') && currentSession;
  const canEditSession = userRole === 'tutor' && hasSessionInfo && currentSession;
  const canCancel = booking.status === 'Pending' || booking.status === 'Confirmed';
  const canAcceptReject = userRole === 'tutor' && booking.status === 'Pending';
  const canComplete = userRole === 'tutor' && booking.status === 'Confirmed' && new Date(booking.endTime) < new Date();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <h3 className="font-semibold text-gray-300 mb-1 flex items-center">
            <User className="w-4 h-4 mr-1.5 text-gray-500" /> 
            {userRole === 'student' ? 'Tutor:' : 'Student:'}
          </h3>
          <p className="text-white">
            {userRole === 'student' ? booking.tutorName || 'N/A' : booking.studentName || 'N/A'}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-300 mb-1 flex items-center">
            <Tag className="w-4 h-4 mr-1.5 text-gray-500" /> Topic/Skill:
          </h3>
          <p className="text-white">{booking.topic}</p>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-300 mb-1 flex items-center">
          <CalendarDays className="w-4 h-4 mr-1.5 text-gray-500" /> Date:
        </h3>
        <p className="text-white">{format(new Date(booking.sessionDate || booking.startTime), 'EEEE, MMMM dd, yyyy')}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-300 mb-1 flex items-center">
          <Clock className="w-4 h-4 mr-1.5 text-gray-500" /> Time:
        </h3>
        <p className="text-white">
          {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
        </p>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-300 mb-1 flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-1.5 text-gray-500" /> Status:
        </h3>
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
          <h3 className="font-semibold text-gray-300 mb-1 flex items-center">
            <FileText className="w-4 h-4 mr-1.5 text-gray-500" /> Description/Notes:
          </h3>
          <p className="text-gray-300 bg-gray-800 p-3 rounded-md whitespace-pre-wrap">
            {booking.description}
          </p>
        </div>
      )}

      {hasSessionInfo && (
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-300 flex items-center">
              <Video className="w-4 h-4 mr-1.5 text-blue-400" />
              Session Information
            </h3>
            {canEditSession && (
              <EditSessionForm
                session={currentSession}
                onSessionUpdated={handleSessionUpdated}
              />
            )}
          </div>
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
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">
                {userRole === 'student' ? 'Tutor Contact' : 'Student Contact'}
              </h4>
              <p className="text-white">
                {userRole === 'student' ? booking.tutorName : booking.studentName}
              </p>
            </div>
            {isSessionUpcoming && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Session Access</h4>
                <p className="text-sm text-blue-400">
                  {currentSession?.videoCallLink
                    ? 'Ready to join'
                    : 'Link pending from tutor'}
                </p>
              </div>
            )}
          </div>
          
          {currentSession?.sessionNotes && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Session Preparation Notes</h4>
              <p className="text-gray-300 bg-gray-800 p-3 rounded-md whitespace-pre-wrap">
                {currentSession.sessionNotes}
              </p>
            </div>
          )}
          
          {currentSession?.videoCallLink && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Meeting Link</h4>
              <div className="flex items-center space-x-2">
                <p className="text-blue-400 text-sm break-all">
                  {currentSession.videoCallLink}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(currentSession?.videoCallLink, '_blank')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
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

      {showActions && (
        <div className="border-t border-gray-700 pt-4">
          <div className="flex flex-wrap gap-2">
            {isSessionUpcoming && (
              <>
                <Button
                  variant="default"
                  onClick={handleJoinSession}
                  className={`${currentSession?.videoCallLink
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                  disabled={!currentSession?.videoCallLink}
                >
                  <Video className="w-4 h-4 mr-2" />
                  {currentSession?.videoCallLink ? 'Join Session' : 'Link Pending'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleContactUser}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact {userRole === 'student' ? 'Tutor' : 'Student'}
                </Button>
              </>
            )}
            
            {canAcceptReject && (
              <>
                <Button 
                  onClick={() => onUpdateStatus?.('Confirmed')} 
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Processing...' : 'Accept & Create Session'}
                </Button>
                <Button 
                  onClick={() => onUpdateStatus?.('Rejected')}
                  disabled={isUpdating}
                  variant="destructive"
                >
                  {isUpdating ? 'Rejecting...' : 'Reject Booking'}
                </Button>
              </>
            )}

            {canComplete && (
              <Button 
                onClick={() => onUpdateStatus?.('Completed')} 
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isUpdating ? 'Completing...' : 'Mark as Completed'}
              </Button>
            )}
            
            {canCancel && userRole === 'tutor' && (
              <Button
                variant="destructive"
                onClick={onCancelBooking}
                disabled={isUpdating}
                className="bg-red-600 hover:bg-red-700"
              >
                {isUpdating ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};