import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar, Clock, User, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentService } from '@/services/PaymentService';
import type { Booking } from '@/types/booking.types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CheckoutFormProps {
  booking: Booking;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ booking }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardHolder: '',
  });
  const navigate = useNavigate();

  const price = useMemo(() => {
    if (!booking || booking.price === undefined) return 0;
    return booking.price;
  }, [booking]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const paymentData = {
        bookingId: booking.bookingId,
        amount: price,
        paymentMethod: 'Card', // This would be more dynamic in a real app
      };

      const result = await PaymentService.processPayment(paymentData);

      if (result.success) {
        toast.success('Payment successful!');
        navigate(`/payment-success?bookingId=${booking.bookingId}`);
      } else {
        const getErrorMessage = (error: unknown): string => {
          if (typeof error === 'string') {
            return error;
          }
          if (error && typeof error === 'object' && 'message' in error) {
            return (error as { message: string }).message;
          }
          return 'Payment failed. Please try again.';
        };
        const errorMessage = getErrorMessage(result.error);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = (err as Error).message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div>
          <Label htmlFor="cardHolder">Card Holder</Label>
          <Input
            id="cardHolder"
            name="cardHolder"
            value={cardDetails.cardHolder}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={handleChange}
            placeholder="**** **** **** ****"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              value={cardDetails.expiryDate}
              onChange={handleChange}
              placeholder="MM/YY"
              required
            />
          </div>
          <div>
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              name="cvc"
              value={cardDetails.cvc}
              onChange={handleChange}
              placeholder="123"
              required
            />
          </div>
        </div>
        <Button disabled={isLoading} className="w-full mt-6">
          {isLoading ? 'Processing...' : `Pay ${price.toLocaleString()} VND`}
        </Button>
      </form>
    </div>
  );
};

export default CheckoutForm;