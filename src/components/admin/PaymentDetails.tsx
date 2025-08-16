import type { Payment } from '@/types/payment.types';

interface PaymentDetailsProps {
  payment: Payment;
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} VND`;
};

const PaymentDetails = ({ payment }: PaymentDetailsProps) => {
  return (
    <div>
      <p><strong>Payment ID:</strong> {payment.id}</p>
      <p><strong>Booking ID:</strong> {payment.bookingId}</p>
      <p><strong>Student:</strong> {payment.studentName}</p>
      <p><strong>Tutor:</strong> {payment.tutorName}</p>
      <p><strong>Amount:</strong> {formatCurrency(payment.amount)}</p>
      <p><strong>Status:</strong> {payment.status}</p>
      <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
    </div>
  );
};

export default PaymentDetails;