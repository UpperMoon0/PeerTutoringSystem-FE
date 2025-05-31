import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TutorSidebar from '@/components/layout/TutorSidebar';
import ManageAvailabilitySection from '@/components/tutor/ManageAvailabilitySection';
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
  ArrowLeft
} from 'lucide-react';
import type { Booking } from '@/types/booking.types';

interface DashboardStats {
  totalBookings: number;
  availableSlots: number;
  completedSessions: number;
  earnings: number;
}

type DashboardSection = 'overview' | 'availability';

const TutorDashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    availableSlots: 0,
    completedSessions: 0,
    earnings: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle URL-based navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    if (section === 'availability') {
      setActiveSection('availability');
    } else {
      setActiveSection('overview');
    }
  }, [location.search]);

  // Update URL when section changes
  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    const newUrl = section === 'availability' ? '/tutor?section=availability' : '/tutor';
    navigate(newUrl, { replace: true });
  };

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'default';
      case 'Pending': return 'secondary';
      case 'Completed': return 'default';
      case 'Cancelled': return 'destructive';
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
    <div className="h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <TutorSidebar onAvailabilityClick={() => handleSectionChange('availability')} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {activeSection !== 'overview' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSectionChange('overview')}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">
                  {activeSection === 'overview' ? 'Dashboard' : 'Manage Availability'}
                </h1>
                <p className="text-gray-400 mt-1 text-sm lg:text-base">
                  {activeSection === 'overview'
                    ? "Welcome back! Here's your tutoring overview."
                    : "Set your available time slots for tutoring sessions."
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {activeSection === 'overview' && (
                <Button
                  onClick={() => handleSectionChange('availability')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm lg:text-base px-3 lg:px-4"
                >
                  <CalendarDays className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Manage Availability</span>
                  <span className="sm:hidden">Availability</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-950">
          {activeSection === 'overview' ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  onClick={() => handleSectionChange('availability')}
                  className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                >
                  <Link to="/tutor/bookings">
                    <Eye className="w-4 h-4 mr-2" />
                    View Bookings
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                >
                  <Link to="/profile">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Profile
                  </Link>
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
                  <Link 
                    to="/tutor/bookings" 
                    className="text-blue-400 hover:text-blue-300 text-sm font-normal"
                  >
                    View all
                  </Link>
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
            </>
          ) : (
            /* Availability Management Section */
            <ManageAvailabilitySection />
          )}
        </main>
      </div>
    </div>
  );
};

export default TutorDashboardPage;