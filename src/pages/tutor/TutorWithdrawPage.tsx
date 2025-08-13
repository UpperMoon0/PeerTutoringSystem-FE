import { useEffect, useState } from 'react';
import WithdrawalForm from '@/components/tutor/WithdrawalForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TutorService } from '@/services/TutorService';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} VND`;
};

const TutorWithdrawPage = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const result = await TutorService.getUserBalance();
        if (result.success && result.data) {
          setBalance(result.data.balance);
        } else {
          if (typeof result.error === 'string') {
            setError(result.error);
          } else {
            setError('Failed to fetch balance.');
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

    fetchBalance();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create Withdraw Request</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="text-2xl font-bold">{formatCurrency(balance ?? 0)}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <WithdrawalForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorWithdrawPage;