import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  BookOpen, 
  User, 
  BarChart3, 
  Settings, 
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';

const TutorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Check if user is logged in and is a tutor
  if (!currentUser || currentUser.role !== 'tutor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-100 w-fit">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Access Denied</CardTitle>
            <p className="text-gray-600 mb-6">You must be logged in as a tutor to access this page.</p>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard features with enhanced styling
  const dashboardFeatures = [
    {
      title: 'Manage Bookings',
      description: 'View and manage your upcoming sessions, accept or decline requests, and track your booking history.',
      icon: BookOpen,
      href: '/tutor/bookings',
      gradient: 'from-blue-500 to-blue-600',
      badge: 'Core Feature',
      badgeColor: 'bg-blue-100 text-blue-800',
      textColor: 'text-blue-600'
    },
    {
      title: 'Manage Availability',
      description: 'Set your available time slots, manage your schedule, and update your tutoring hours.',
      icon: Calendar,
      href: '/tutor/availability',
      gradient: 'from-green-500 to-green-600',
      badge: 'Essential',
      badgeColor: 'bg-green-100 text-green-800',
      textColor: 'text-green-600'
    },
    {
      title: 'Manage Profile',
      description: 'Update your tutor profile, bio, skills, experience, and hourly rates.',
      icon: User,
      href: '/profile',
      gradient: 'from-purple-500 to-purple-600',
      badge: 'Profile',
      badgeColor: 'bg-purple-100 text-purple-800',
      textColor: 'text-purple-600'
    }
  ];

  // Quick stats for the dashboard
  const quickStats = [
    {
      title: 'Active Bookings',
      value: '5',
      icon: BookOpen,
      description: 'Sessions scheduled this week',
      color: 'text-blue-600'
    },
    {
      title: 'Available Hours',
      value: '24',
      icon: Clock,
      description: 'Hours available this week',
      color: 'text-green-600'
    },
    {
      title: 'Total Students',
      value: '12',
      icon: Users,
      description: 'Students you\'ve tutored',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tutor Dashboard</h1>          <p className="text-lg text-gray-600">
            Welcome back, {currentUser?.fullName || 'Tutor'}! Manage your tutoring activities from here.
          </p>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardFeatures.map((feature, index) => (
            <Link key={index} to={feature.href} className="group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-2 hover:border-gray-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100 w-fit group-hover:bg-gray-200 transition-colors">
                    <feature.icon className={`h-8 w-8 ${feature.textColor}`} />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-gray-900">
                      {feature.title}
                    </CardTitle>
                    <Badge className={`text-xs ${feature.badgeColor}`}>
                      {feature.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <Button className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white`}>
                    Go to {feature.title}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Additional Quick Actions */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <Settings className="h-6 w-6" />
                Quick Actions
              </CardTitle>
              <p className="text-gray-600 mb-4">
                Need to do something quickly? Use these shortcuts to common actions.
              </p>
              <div className="space-x-4">
                <Link to="/tutor/bookings">
                  <Button variant="outline" className="hover:bg-blue-50">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="hover:bg-green-50">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboardPage;
