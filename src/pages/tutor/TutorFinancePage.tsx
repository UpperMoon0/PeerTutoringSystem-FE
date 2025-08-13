import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { TutorService } from '@/services/TutorService';
import type { TutorFinanceDetails, Transaction } from '@/types/tutor.types';
import WithdrawalForm from '@/components/tutor/WithdrawalForm';

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

  const {
    totalProfit = 0,
    bookings = [],
    monthlyEarnings = [],
    recentTransactions = [],
  } = financeDetails;

  // For simplicity, we'll display the latest two months from monthlyEarnings
  const currentMonthData = monthlyEarnings.length > 0 ? monthlyEarnings[monthlyEarnings.length - 1] : { month: 'N/A', earnings: 0 };
  const lastMonthData = monthlyEarnings.length > 1 ? monthlyEarnings[monthlyEarnings.length - 2] : { month: 'N/A', earnings: 0 };

  return (
    <div className="container mx-auto p-4">
      <div>
        <div>
          <h1 className="text-3xl font-bold mb-6">Overview</h1>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Current Month ({currentMonthData.month})</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(currentMonthData.earnings)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Last Month ({lastMonthData.month})</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(lastMonthData.earnings)}</p>
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

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Earnings Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="earnings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.bookingId}>
                      <TableCell>{new Date(booking.sessionDate).toLocaleDateString()}</TableCell>
                      <TableCell>{booking.student?.fullName}</TableCell>
                      <TableCell>{booking.status}</TableCell>
                      <TableCell className="text-right">{formatCurrency(booking.basePrice ?? 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TutorFinancePage;