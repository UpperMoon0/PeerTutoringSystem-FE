import React, { useEffect, useState } from 'react';
import { PaymentService } from '@/services/PaymentService';
import type { Payment } from '@/types/payment.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import PaymentList from '@/components/admin/PaymentList';

const TransactionHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const result = await PaymentService.getTransactionHistory();
        if (result.success && result.data) {
          const paymentsData = result.data.map((item: any) => ({
            ...item,
            createdAt: item.transactionDate,
          }));
          setPayments(paymentsData as Payment[]);
        } else {
          setError(typeof result.error === 'string' ? result.error : 'Failed to fetch transaction history.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentList payments={payments} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistoryPage;