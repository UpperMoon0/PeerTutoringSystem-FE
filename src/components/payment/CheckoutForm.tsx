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

const CheckoutForm: React.FC<CheckoutFormProps> = ({ booking }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const { basePrice = 0, serviceFee = 0 } = booking;
  const totalPrice = useMemo(() => basePrice + serviceFee, [basePrice, serviceFee]);
  const platformFee = serviceFee;

  const handleCreatePaymentLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await PaymentService.createPaymentLink({
        bookingId: booking.bookingId,
        cancelUrl: 'http://localhost:5173/payment/cancel',
        returnUrl: `http://localhost:5173/payment-success?bookingId=${booking.bookingId}`,
      });
      if (result.success && result.data) {
        setCheckoutUrl(result.data.data.checkoutUrl);
      } else {
        setError('Failed to create payment link.');
        toast.error('Failed to create payment link.');
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
    handleCreatePaymentLink();
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
          <div className="flex items-center">
            <span>Base Price:</span>
            <span className="ml-auto">{basePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} VND</span>
          </div>
          <div className="flex items-center">
            <span>Platform Service Fee (30%):</span>
            <span className="ml-auto">{platformFee.toLocaleString(undefined, { maximumFractionDigits: 0 })} VND</span>
          </div>
          <div className="border-t my-2" />
          <div className="flex items-center text-xl font-bold">
            <span>Total:</span>
            <span className="ml-auto">{totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} VND</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">PayOS Payment</h3>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {checkoutUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Proceed to Payment
            </a>
            <p className="text-center text-muted-foreground">
              You will be redirected to the PayOS payment gateway.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            {isLoading ? (
              <p>Generating payment link...</p>
            ) : (
              <p className="text-center text-muted-foreground">Could not generate payment link. Please try again later.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;