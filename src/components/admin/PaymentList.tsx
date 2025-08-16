import type { Payment } from '@/types/payment.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import PaymentDetails from './PaymentDetails';

interface PaymentListProps {
  payments: Payment[];
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} VND`;
};

const PaymentList = ({ payments }: PaymentListProps) => {
  if (payments.length === 0) {
    return <div className="text-center p-4">No payments found.</div>;
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <Dialog key={payment.id}>
                <DialogTrigger asChild>
                  <TableRow className="cursor-pointer">
                    <TableCell>{payment.studentName}</TableCell>
                    <TableCell>{payment.tutorName}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                    <TableCell>{new Date(payment.transactionDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                  </DialogHeader>
                  <PaymentDetails payment={payment} />
                </DialogContent>
              </Dialog>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PaymentList;