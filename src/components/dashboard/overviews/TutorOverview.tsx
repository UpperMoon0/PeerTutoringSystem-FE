import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingService } from '@/services/BookingService';
import {
  Calendar,
  BookOpen,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Eye,
  CheckCircle,
  AlertCircle,
  Edit,
  User,
  CalendarDays,
  PlusCircle
} from 'lucide-react';
import type { Booking } from '@/types/booking.types';

interface DashboardStats {
  totalBookings: number;
  availableSlots: number;
  completedSessions: number;
  earnings: number;
}

interface TutorOverviewProps {
  onNavigateToSection?: (section: string) => void;
}

const TutorOverview: React.FC<TutorOverviewProps> = ({ onNavigateToSection }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    availableSlots: 0,
    completedSessions: 0,
    earnings: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load tutor bookings
      const bookingsResult = await BookingService.getTutorBookings('All', 1, 5);
      if (bookingsResult.success && bookingsResult.data) {
        setRecentBookings(bookingsResult.data.bookings);
        
        // Calculate stats from bookings
        const totalBookings = bookingsResult.data.totalCount;
        const completedSessions = bookingsResult.data.bookings.filter(b => b.status === 'Completed').length;
        
        setStats(prev => ({
          ...prev,
          totalBookings,
          completedSessions,
          earnings: completedSessions * 50, // Mock calculation
          availableSlots: 12 // Mock data
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (section: string) => {
    if (onNavigateToSection) {
      onNavigateToSection(section);
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Tutor!</h2>
        <p className="text-gray-400">Here's your tutoring overview and recent activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalBookings}</p>
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
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Available Slots</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.availableSlots}</p>
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
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Completed Sessions</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.completedSessions}</p>
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
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold text-white mt-2">${stats.earnings}</p>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your tutoring activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => handleQuickAction('availability')}
              className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Manage Availability
            </Button>
            <Button
              onClick={() => handleQuickAction('bookings')}
              variant="outline"
              className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Manage Bookings
            </Button>
            <Button 
              onClick={() => handleQuickAction('profile')}
              variant="outline" 
              className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Tutor Profile
            </Button>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                Recent Bookings
              </span>
              <Button
                variant="ghost"
                onClick={() => handleQuickAction('bookings')}
                className="text-blue-400 hover:text-blue-300 text-sm font-normal"
              >
                View all
              </Button>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your latest student bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-800 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div 
                    key={booking.bookingId} 
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <User className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{booking.topic}</p>
                        <p className="text-gray-400 text-sm">
                          with {booking.studentName || 'Student'}
                        </p>
                        <p className="text-gray-500 text-xs">
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
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No recent bookings</p>
                <p className="text-gray-500 text-sm mt-1">
                  Students will appear here once they book sessions with you
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions Preview */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-400" />
            Session Calendar Preview
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your upcoming tutoring sessions this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="aspect-square bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors">
                <div className="text-white text-sm font-medium">{i + 15}</div>
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
                <span className="text-gray-400">Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-400">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-400">Pending</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('availability')}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
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