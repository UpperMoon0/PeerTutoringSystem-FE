import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import CheckoutForm from '@/components/payment/CheckoutForm';
import ProofOfPaymentUploader from '@/components/payment/ProofOfPaymentUploader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookingService } from '@/services/BookingService';
import type { Booking } from '@/types/booking.types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const { bookingId: bookingIdFromState } = location.state || {};
  const { bookingId: bookingIdFromParams } = useParams<{ bookingId: string }>();
  const bookingId = bookingIdFromState || bookingIdFromParams;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      const fetchBooking = async () => {
        setLoading(true);
        try {
          const result = await BookingService.getBookingById(bookingId);
          if (result.success && result.data) {
            setBooking(result.data);
          } else {
            const errorMessage = typeof result.error === 'string'
              ? result.error
              : result.error?.message || 'Failed to fetch booking details.';
            setError(errorMessage);
          }
        } catch (err: unknown) {
          setError((err as Error).message || 'An unexpected error occurred.');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    } else {
      setError('No booking ID provided.');
      setLoading(false);
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="container mx-auto my-10 max-w-2xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto my-10 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Booking not found.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
  };

  const handleUploadSuccess = (filePath: string) => {
    // You can optionally update the booking state or show a success message
    console.log('Upload successful:', filePath);
  };

  return (
    <div className="container mx-auto my-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>Review your booking and enter your card details to finalize.</CardDescription>
        </CardHeader>
        <CardContent>
          {!paymentSuccess ? (
            <CheckoutForm booking={booking} onPaymentSuccess={handlePaymentSuccess} />
          ) : (
            <ProofOfPaymentUploader bookingId={booking.bookingId} onUploadSuccess={handleUploadSuccess} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutPage;