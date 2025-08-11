import React, { useState, useEffect } from 'react';
import { BookingService } from '@/services/BookingService';
import type { Booking } from '@/types/booking.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const result = await BookingService.getAllBookingsForAdmin();
        if (result.success && result.data) {
          setBookings(result.data.bookings);
        } else {
          setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to fetch bookings.');
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleConfirmPayment = async (bookingId: string) => {
    try {
      const result = await BookingService.confirmPayment(bookingId, { status: 'Paid' });
      if (result.success) {
        toast.success('Payment confirmed successfully.');
        setBookings(bookings.map(b => b.bookingId === bookingId ? { ...b, paymentStatus: 'Paid' } : b));
      } else {
        toast.error(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to confirm payment.');
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'An unexpected error occurred.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Proof of Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map(booking => (
              <TableRow key={booking.bookingId}>
                <TableCell>{booking.studentName}</TableCell>
                <TableCell>{booking.tutorName}</TableCell>
                <TableCell>{new Date(booking.sessionDate).toLocaleDateString()}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>{booking.paymentStatus}</TableCell>
                <TableCell>
                  {booking.proofOfPaymentImageUrl && (
                    <a href={`${import.meta.env.VITE_API_BASE_URL}${booking.proofOfPaymentImageUrl}`} target="_blank" rel="noopener noreferrer">
                      View Proof
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  {booking.paymentStatus === 'Unpaid' && booking.proofOfPaymentImageUrl && (
                    <Button onClick={() => handleConfirmPayment(booking.bookingId)}>
                      Confirm Payment
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminBookingsPage;