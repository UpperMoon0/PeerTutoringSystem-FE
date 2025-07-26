import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success('Payment successful! Your booking is confirmed.');

    const timer = setTimeout(() => {
      navigate('/student/booking-history');
    }, 5000); // 5-second delay before redirecting

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [navigate]);

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