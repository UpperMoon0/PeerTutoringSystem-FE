import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TutorService } from '@/services/TutorService';
import type { TutorFinanceDetails } from '@/types/tutor.types';

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} VND`;
};

const TutorFinancePage = () => {
  const [financeDetails, setFinanceDetails] = useState<TutorFinanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinanceDetails = async () => {
      try {
        setLoading(true);
        const result = await TutorService.getTutorFinanceDetails();
        if (result.success && result.data) {
          setFinanceDetails(result.data);
        } else {
          if (typeof result.error === 'string') {
            setError(result.error);
          } else {
            setError('Failed to fetch finance details.');
          }
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

  const { totalProfit = 0 } = financeDetails;

  return (
    <div className="container mx-auto p-4">
      <div>
        <div>
          <h1 className="text-3xl font-bold mb-6">Overview</h1>
          <div className="grid gap-4 md:grid-cols-3 mb-8">
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
      </div>
    </div>
  );
};

export default TutorFinancePage;