import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { confirmPayment } from '@/services/paymentService';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const { mutate: confirmPaymentMutation } = useMutation({
    mutationFn: confirmPayment,
    onSuccess: () => {
      setStatus('success');
      toast.success('Payment successful! Your booking is confirmed.');
      const timer = setTimeout(() => {
        navigate('/student/booking-history');
      }, 5000);
      return () => clearTimeout(timer);
    },
    onError: () => {
      setStatus('error');
      toast.error('An error occurred while confirming your payment. Please contact support.');
    },
  });

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId) {
      confirmPaymentMutation(bookingId);
    } else {
      setStatus('error');
      toast.error('No booking ID found. Cannot confirm payment.');
    }
  }, [searchParams, confirmPaymentMutation]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto mt-10 text-center flex flex-col items-center justify-center h-full">
        <Loader2 className="w-20 h-20 mx-auto text-primary animate-spin mb-6" />
        <h1 className="mt-4 text-4xl font-bold text-foreground">Confirming Payment...</h1>
        <p className="mt-3 text-xl text-muted-foreground max-w-md">
          Please wait while we confirm your payment. This may take a few moments.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto mt-10 text-center flex flex-col items-center justify-center h-full">
        <AlertTriangle className="w-20 h-20 mx-auto text-destructive mb-6" />
        <h1 className="mt-4 text-4xl font-bold text-foreground">Payment Confirmation Failed</h1>
        <p className="mt-3 text-xl text-muted-foreground max-w-md">
          We were unable to confirm your payment. Please contact support with your booking details.
        </p>
        <Button asChild className="mt-10">
          <Link to="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 text-center flex flex-col items-center justify-center h-full">
      <CheckCircle className="w-20 h-20 mx-auto text-primary mb-6" />
      <h1 className="mt-4 text-4xl font-bold text-foreground">Payment Successful!</h1>
      <p className="mt-3 text-xl text-muted-foreground max-w-md">
        Thank you for your payment. Your booking has been confirmed and the details have been updated.
      </p>
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          You will be redirected to your booking history shortly.
        </p>
        <Loader2 className="w-8 h-8 mx-auto mt-4 text-primary animate-spin" />
      </div>
      <Button asChild className="mt-10">
        <Link to="/student/booking-history">Go to Booking History Now</Link>
      </Button>
    </div>
  );
};

export default PaymentSuccessPage;