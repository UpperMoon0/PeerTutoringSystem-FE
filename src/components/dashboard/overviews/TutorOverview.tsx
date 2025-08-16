import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingService } from '@/services/BookingService';
import { TutorService } from '@/services/TutorService';
import { SessionService } from '@/services/SessionService';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  BookOpen,
  Clock,
  DollarSign,
  Users,
  PlusCircle
} from 'lucide-react';
import type { Booking } from '@/types/booking.types';
import type { Session } from '@/types/session.types';
import type { TutorDashboardStats, TutorFinanceDetails } from '@/types/tutor.types';
import { BookingList } from '@/components/booking/BookingList';
import type { ApiResult } from '@/types/api.types';

type BookingStatus = 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';

interface TutorOverviewProps {
  onNavigateToSection?: (section: string) => void;
}

const TutorOverview: React.FC<TutorOverviewProps> = ({ onNavigateToSection }) => {
  const [stats, setStats] = useState<TutorDashboardStats | null>(null);
  const [financeDetails, setFinanceDetails] = useState<TutorFinanceDetails | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    loadDashboardData();
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));

      const result = await SessionService.getTutorSessionsForCalendar(
        startOfWeek.toISOString(),
        endOfWeek.toISOString()
      );

      if (result.success && result.data) {
        setSessions(result.data.sessions);
      } else {
        console.error("Failed to load calendar sessions:", result.error);
      }
    } catch (error) {
      console.error("Error loading calendar data:", error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsResult = await TutorService.getTutorDashboardStats();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      } else {
        const errorMessage = typeof statsResult.error === 'string' ? statsResult.error : 'Failed to load dashboard stats.';
        setError(errorMessage);
      }

      const financeDetailsResult = await TutorService.getTutorFinanceDetails();
      if (financeDetailsResult.success && financeDetailsResult.data) {
        setFinanceDetails(financeDetailsResult.data);
      } else {
        const errorMessage = typeof financeDetailsResult.error === 'string' ? financeDetailsResult.error : 'Failed to load finance details.';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBookings = useCallback(
    (status: BookingStatus, page: number, pageSize: number): Promise<ApiResult<{ bookings: Booking[], totalCount: number }>> => {
      return BookingService.getTutorBookings(status, page, pageSize);
    },
    []
  );

  const handleBookingUpdate = () => {
    setKey(prevKey => prevKey + 1);
    loadDashboardData(); // Re-fetch stats after an update
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, Tutor!</h2>
        <p className="text-muted-foreground">Here's your tutoring overview and recent activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <Card className="bg-card border-border">
              <CardContent className="p-4 lg:p-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-12 w-1/2 mt-2" />
                <Skeleton className="h-4 w-1/4 mt-1" />
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 lg:p-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-12 w-1/2 mt-2" />
                <Skeleton className="h-4 w-1/4 mt-1" />
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 lg:p-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-12 w-1/2 mt-2" />
                <Skeleton className="h-4 w-1/4 mt-1" />
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 lg:p-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-12 w-1/2 mt-2" />
                <Skeleton className="h-4 w-1/4 mt-1" />
              </CardContent>
            </Card>
          </>
        ) : stats ? (
          <>

            {/* Total Bookings */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Bookings</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.totalBookings}</p>
                  </div>
                  <div className="p-3 bg-blue-600 bg-opacity-20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Slots */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Available Slots</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.availableSlots}</p>
                    <p className="text-blue-500 text-sm mt-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      This week
                    </p>
                  </div>
                  <div className="p-3 bg-purple-600 bg-opacity-20 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed Sessions */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Completed Sessions</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.completedSessions}</p>
                  </div>
                  <div className="p-3 bg-green-600 bg-opacity-20 rounded-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Profit</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{financeDetails?.totalProfit?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) ?? '0 VND'}</p>
                  </div>
                  <div className="p-3 bg-green-600 bg-opacity-20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="col-span-full text-center text-red-500">{error}</div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Bookings */}
        <BookingList
          key={key}
          fetchBookings={fetchRecentBookings}
          userRole="tutor"
          title="Recent Bookings"
          onBookingUpdate={handleBookingUpdate}
          showStats={false}
          itemPerPage={5}
        />
      </div>

      {/* Upcoming Sessions Preview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-400" />
            Session Calendar Preview
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your upcoming tutoring sessions this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-muted-foreground text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const dayDate = new Date();
              dayDate.setDate(dayDate.getDate() - dayDate.getDay() + 1 + i);
              const daySessions = sessions.filter(s => new Date(s.startTime).toDateString() === dayDate.toDateString());

              return (
                <div key={i} className="aspect-square bg-muted rounded-lg p-2 hover:bg-accent transition-colors">
                  <div className="text-foreground text-sm font-medium">{dayDate.getDate()}</div>
                  <div className="mt-1 space-y-1">
                    {daySessions.map(session => (
                      <div key={session.sessionId} className="w-2 h-2 bg-blue-400 rounded-full" title={`Session at ${new Date(session.startTime).toLocaleTimeString()}`}></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-muted-foreground">Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-muted-foreground">Pending</span>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => onNavigateToSection?.('availability')}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorOverview;