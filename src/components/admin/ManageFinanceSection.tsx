import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { AdminFinanceDetails, Payment } from '@/types/payment.types';
import { PaymentService } from '@/services/PaymentService';
import PaymentList from './PaymentList';

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} VND`;
};

const ManageFinanceSection = () => {
  const [financeDetails, setFinanceDetails] = useState<AdminFinanceDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        const [financeResult, paymentsResult] = await Promise.all([
          PaymentService.getAdminFinanceDetails(),
          PaymentService.getAllPayments(),
        ]);

        if (financeResult.success && financeResult.data) {
          setFinanceDetails(financeResult.data);
        } else {
          setError(typeof financeResult.error === 'string' ? financeResult.error : 'Failed to fetch finance details.');
        }

        if (paymentsResult.success && paymentsResult.data) {
          setPayments(paymentsResult.data);
        } else {
          setError(typeof paymentsResult.error === 'string' ? paymentsResult.error : 'Failed to fetch payments.');
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="mt-8">
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!financeDetails) {
    return <div className="text-center p-4">No financial data available.</div>;
  }

  const { totalPayments = 0, totalIncome = 0, totalProfit = 0 } = financeDetails;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Financial Overview</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPayments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">All Payments</h2>
      <PaymentList payments={payments} />
    </div>
  );
};

export default ManageFinanceSection;