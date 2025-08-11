import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingService } from '@/services/BookingService';
import { TutorService } from '@/services/TutorService';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  BookOpen,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  User,
  PlusCircle
} from 'lucide-react';
import type { Booking } from '@/types/booking.types';
import type { TutorDashboardStats } from '@/types/tutor.types';

interface TutorOverviewProps {
  onNavigateToSection?: (section: string) => void;
}

const TutorOverview: React.FC<TutorOverviewProps> = () => {
  const [stats, setStats] = useState<TutorDashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

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
      
      // Load recent bookings
      const bookingsResult = await BookingService.getTutorBookings('All', 1, 5);
      if (bookingsResult.success && bookingsResult.data) {
        setRecentBookings(bookingsResult.data.bookings);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };


  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Confirmed': return 'default';
      case 'Cancelled':
      case 'Rejected': return 'destructive';
      case 'Completed': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProfit = (amount: number) => amount / 1.3;

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
                    <p className="text-green-500 text-sm mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12% from last month
                    </p>
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
                    <p className="text-green-500 text-sm mt-1 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      +8% from last month
                    </p>
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
                    <p className="text-3xl font-bold text-foreground mt-2">{calculateProfit(stats.totalEarnings).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                    <p className="text-green-500 text-sm mt-1 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      +15% from last month
                    </p>
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
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center justify-between">
              <span className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                Recent Bookings
              </span>
              <Button
                variant="ghost"
                className="text-blue-400 hover:text-blue-300 text-sm font-normal"
              >
                View all
              </Button>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your latest student bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div 
                    key={booking.bookingId} 
                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-background rounded-lg">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{booking.topic}</p>
                        <p className="text-muted-foreground text-sm">
                          with {booking.studentName || 'Student'}
                        </p>
                        <p className="text-muted-foreground/80 text-xs">
                          {formatDateTime(booking.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={getStatusBadgeVariant(booking.status)}
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                      {booking.status === 'Pending' && (
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No recent bookings</p>
                <p className="text-muted-foreground/80 text-sm mt-1">
                  Students will appear here once they book sessions with you
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg p-2 hover:bg-accent transition-colors">
                <div className="text-foreground text-sm font-medium">{i + 15}</div>
                {i === 2 && (
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                )}
                {i === 4 && (
                  <div className="mt-1 space-y-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
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
              variant="outline"
              size="sm"
              className="bg-muted border-border text-foreground hover:bg-accent"
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