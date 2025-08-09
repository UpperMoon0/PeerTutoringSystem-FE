import React, { useState, useMemo, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar, Clock, User, Tag } from 'lucide-react';
import { PaymentService } from '@/services/PaymentService';
import type { Booking } from '@/types/booking.types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CheckoutFormProps {
  booking: Booking;
  onPaymentSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ booking, onPaymentSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const price = useMemo(() => {
    if (!booking || booking.price === undefined) return 0;
    return booking.price;
  }, [booking]);

  const handleGenerateQR = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await PaymentService.generateQrCode({
        bookingId: booking.bookingId,
        ReturnUrl: 'http://localhost:5173/payment/success',
      });
      if (result.success && result.data) {
        setQrCodeUrl(result.data.qrCode);
      } else {
        setError('Failed to generate QR code.');
        toast.error('Failed to generate QR code.');
      }
    } catch (err) {
      const errorMessage = (err as Error).message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handlePaymentResult = async () => {
      // This is a mock implementation. In a real scenario, you would
      // listen for a webhook or poll the backend to check for payment status.
      // For this example, we'll just assume the payment is successful after a delay.
      setTimeout(() => {
        toast({
          title: 'Payment Successful',
          description: 'Your booking has been confirmed.',
        });
        onPaymentSuccess();
      }, 5000); // 5 second delay to simulate payment processing
    };

    if (qrCodeUrl) {
      handlePaymentResult();
    }
  }, [qrCodeUrl, onPaymentSuccess]);

  useEffect(() => {
    handleGenerateQR();
  }, [booking.bookingId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Booking Summary</h3>
        <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="font-semibold">Tutor:</span>
            <span className="ml-auto">{booking.tutorName}</span>
          </div>
          <div className="flex items-center">
            <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="font-semibold">Topic:</span>
            <span className="ml-auto">{booking.topic}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="font-semibold">Date:</span>
            <span className="ml-auto">{format(new Date(booking.sessionDate), 'PPP')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="font-semibold">Time:</span>
            <span className="ml-auto">
              {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
            </span>
          </div>
          <div className="border-t my-2" />
          <div className="flex items-center text-xl font-bold">
            <span>Total:</span>
            <span className="ml-auto">{price.toLocaleString()} VND</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">QR Code Payment</h3>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {qrCodeUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-64 object-contain border rounded-lg"
            />
            <p className="text-center text-muted-foreground">
              Scan this QR code with your banking app to complete the payment.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            {isLoading ? (
              <p>Generating QR Code...</p>
            ) : (
              <p className="text-center text-muted-foreground">Could not generate QR code. Please try again later.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;