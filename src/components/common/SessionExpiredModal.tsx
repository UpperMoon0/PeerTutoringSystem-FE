import React, { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BookingService } from '@/services/BookingService';
import type { Booking } from '@/types/booking.types';
import { getStatusBadgeVariant, getStatusString } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onClose }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchBookings = async () => {
        setIsLoading(true);
        const result = await BookingService.getStudentBookingHistory({ page: 1, pageSize: 5 });
        if (result.success) {
          const fetchedBookings = result.data.bookings;
          setBookings(fetchedBookings);
          const newStats = {
            total: result.data.totalCount,
            pending: fetchedBookings.filter(b => getStatusString(b.status) === 'Pending').length,
            confirmed: fetchedBookings.filter(b => getStatusString(b.status) === 'Confirmed').length,
            cancelled: fetchedBookings.filter(b => getStatusString(b.status) === 'Cancelled').length,
            completed: fetchedBookings.filter(b => getStatusString(b.status) === 'Completed').length,
            rejected: fetchedBookings.filter(b => getStatusString(b.status) === 'Rejected').length,
          };
          setStats(newStats);
        }
        setIsLoading(false);
      };
      fetchBookings();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card text-foreground border-border max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Session Expired</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Your session has expired. Here's a summary of your recent activity. Please log in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid grid-cols-1 gap-4 my-4">
            <div className="grid grid-cols-1 gap-2 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
                <div>
                    <div className="font-bold">{stats.pending}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div>
                    <div className="font-bold">{stats.confirmed}</div>
                    <div className="text-xs text-muted-foreground">Confirmed</div>
                </div>
                <div>
                    <div className="font-bold">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                    <div className="font-bold">{stats.cancelled}</div>
                    <div className="text-xs text-muted-foreground">Cancelled</div>
                </div>
                <div>
                    <div className="font-bold">{stats.rejected}</div>
                    <div className="text-xs text-muted-foreground">Rejected</div>
                </div>
            </div>
        </div>

        {isLoading ? (
          <p>Loading recent bookings...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.bookingId}>
                  <TableCell>{booking.tutorName}</TableCell>
                  <TableCell>{booking.topic}</TableCell>
                  <TableCell>{format(new Date(booking.sessionDate), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(booking.status)} className="text-sm capitalize">
                      {getStatusString(booking.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="bg-primary text-primary-foreground hover:bg-primary/90">Login</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionExpiredModal;
