import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { AdminFinanceDetails } from '@/types/payment.types';
import { PaymentService } from '@/services/PaymentService';

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} VND`;
};

const ManageFinanceSection = () => {
  const [financeDetails, setFinanceDetails] = useState<AdminFinanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinanceDetails = async () => {
      try {
        setLoading(true);
        const result = await PaymentService.getAdminFinanceDetails();
        if (result.success && result.data) {
          setFinanceDetails(result.data);
        } else {
          setError(typeof result.error === 'string' ? result.error : 'Failed to fetch finance details.');
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

    fetchFinanceDetails();
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

  const {
    totalPayments = 0,
    totalIncome = 0,
    totalProfit = 0,
  } = financeDetails;

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
    </div>
  );
};

export default ManageFinanceSection;