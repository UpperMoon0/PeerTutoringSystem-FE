import React, { useState } from 'react';
import type { Booking } from '@/types/booking.types';
import { BookingService } from '@/services/BookingService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarDays, Clock, User, Tag, FileText, AlertCircle, XCircle, CheckCircle2, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BookingDetailModalProps {
  booking: Booking | null;
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
            <Badge variant={getStatusBadgeVariant(booking.status)} className="text-sm capitalize">
              {booking.status}
            </Badge>
          </div>

          {booking.description && (
            <div>
              <h3 className="font-semibold text-gray-300 mb-1 flex items-center"><FileText className="w-4 h-4 mr-1.5 text-gray-500" /> Description/Notes:</h3>
              <p className="text-gray-300 bg-gray-800 p-3 rounded-md whitespace-pre-wrap">
                {booking.description}
              </p>
            </div>
          )}

          {booking.skillId && ( // Example of another field
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
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            Close
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};