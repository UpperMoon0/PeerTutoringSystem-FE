import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingService } from '@/services/BookingService';
import type { Booking } from '@/types/booking.types';
import type { ApiResult } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

const TutorBookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookingDetails = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'Tutor' || !bookingId) {
      setError('Authorization error or booking ID missing.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result: ApiResult<Booking> = await BookingService.getBookingById(bookingId);
      if (result.success && result.data) {
        // Ensure the booking belongs to the current tutor
        if (result.data.tutorId !== currentUser.userId) {
            setError('You are not authorized to view this booking.');
            setBooking(null);
        } else {
            setBooking(result.data);
        }
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to fetch booking details.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, currentUser]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const handleUpdateStatus = async (newStatus: Booking['status']) => {
    if (!bookingId || !booking || isUpdating) return;

    setIsUpdating(true);
    setError(null);
    try {
      const result: ApiResult<Booking> = await BookingService.updateBookingStatus(bookingId, newStatus);
      if (result.success && result.data) {
        setBooking(result.data);
        // Optionally, show a success message to the user
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to update booking status.');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating status.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusBadgeVariant = (status: Booking['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Confirmed':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      case 'Completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4"><p>Loading booking details...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/tutor/bookings')} className="mt-4">Back to Bookings</Button>
      </div>
    );
  }

  if (!booking) {
    return (
        <div className="container mx-auto p-4">
            <Alert>
                <AlertTitle>Not Found</AlertTitle>
                <AlertDescription>Booking not found or you do not have permission to view it.</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/tutor/bookings')} className="mt-4">Back to Bookings</Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
          <CardDescription>Review and manage this booking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Student:</h3>
            <p>{booking.studentName || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Date:</h3>
            <p>{format(new Date(booking.startTime), 'PPP')}</p>
          </div>
          <div>
            <h3 className="font-semibold">Time:</h3>
            <p>{format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}</p>
          </div>
          <div>
            <h3 className="font-semibold">Topic:</h3>
            <p>{booking.topic}</p>
          </div>
          <div>
            <h3 className="font-semibold">Description:</h3>
            <p>{booking.description || 'No description provided.'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Current Status:</h3>
            <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
          </div>

          {booking.status === 'Pending' && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Actions:</h3>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleUpdateStatus('Confirmed')} 
                  disabled={isUpdating}
                  variant="default"
                >
                  {isUpdating ? 'Accepting...' : 'Accept Booking'}
                </Button>
                <Button 
                  onClick={() => handleUpdateStatus('Cancelled')} 
                  disabled={isUpdating}
                  variant="destructive"
                >
                  {isUpdating ? 'Rejecting...' : 'Reject Booking'}
                </Button>
              </div>
            </div>
          )}
           {(booking.status === 'Confirmed' && new Date(booking.endTime) < new Date()) && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Actions:</h3>
              <Button 
                onClick={() => handleUpdateStatus('Completed')} 
                disabled={isUpdating}
                variant="outline"
              >
                {isUpdating ? 'Completing...' : 'Mark as Completed'}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/tutor/bookings')} variant="outline">Back to Bookings</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TutorBookingDetailPage;
