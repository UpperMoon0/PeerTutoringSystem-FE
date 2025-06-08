import React, { useState } from 'react';
import type { Booking } from '@/types/booking.types';
import type { Session } from '@/types/session.types';
import { BookingService } from '@/services/BookingService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ListChecks } from 'lucide-react';
import { BookingDetailView } from './BookingDetailView';
import { toast } from 'sonner';

interface BookingWithSession extends Booking {
  session?: Session;
}

interface BookingDetailModalProps {
  booking: BookingWithSession | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingCancelled: () => void;
  userRole?: 'student' | 'tutor';
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  onBookingCancelled,
  userRole = 'student'
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<BookingWithSession | null>(booking);

  if (!booking) return null;

  const handleSessionUpdated = (updatedSession: Session) => {
    if (currentBooking) {
      setCurrentBooking({
        ...currentBooking,
        session: updatedSession
      });
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
        
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <BookingDetailView
            booking={currentBooking || booking}
            userRole={userRole}
            onSessionUpdated={handleSessionUpdated}
            onCancelBooking={handleCancelBooking}
            isUpdating={isCancelling}
            showActions={false} // We'll handle actions in the dialog footer
          />
        </div>
        
        <DialogFooter className="mt-2 pt-4 border-t border-gray-800 gap-2">
          <BookingDetailView
            booking={currentBooking || booking}
            userRole={userRole}
            onContactUser={() => {
              const contactName = userRole === 'student' ? booking.tutorName : booking.studentName;
              toast.info(`Contact feature for ${contactName} would open here.`);
            }}
            onJoinSession={() => {}}
            onSessionUpdated={handleSessionUpdated}
            onCancelBooking={handleCancelBooking}
            isUpdating={isCancelling}
            showActions={true}
          />
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 border-gray-600 mt-4"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};