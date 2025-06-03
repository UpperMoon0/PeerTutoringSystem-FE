import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TutorSidebar from '@/components/layout/TutorSidebar';
import ManageAvailabilitySection from '@/components/tutor/ManageAvailabilitySection';
import ManageBookingsSection from '@/components/tutor/ManageBookingsSection';
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
  ArrowLeft,
  Briefcase, // Added for Profile
  PlusCircle // Added for Create Profile button
} from 'lucide-react';
import type { Booking } from '@/types/booking.types';
import TutorProfileDisplay from '@/components/profile/TutorProfileDisplay';
import TutorProfileForm from '@/components/profile/TutorProfileForm'; // Added for direct editing
import { useAuth } from '@/contexts/AuthContext';
import type { ProfileDto } from '@/types/user.types';
import type { TutorProfileDto, CreateTutorProfileDto, UpdateTutorProfileDto } from '@/types/TutorProfile'; // Added more types
import { ProfileService } from '@/services/ProfileService';
import { TutorProfileService } from '@/services/TutorProfileService';
import { UserSkillService } from '@/services/UserSkillService'; // Added for skill management

interface DashboardStats {
  totalBookings: number;
  availableSlots: number;
  completedSessions: number;
  earnings: number;
}

type DashboardSection = 'overview' | 'availability' | 'bookings' | 'profile';

const TutorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
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
  const [loading, setLoading] = useState(true); // General loading for dashboard data
  const [userProfile, setUserProfile] = useState<ProfileDto | null>(null);
  const [tutorDisplayProfile, setTutorDisplayProfile] = useState<TutorProfileDto | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false); // Added for profile edit mode
  const [isSavingProfile, setIsSavingProfile] = useState(false); // Added for profile save loading state

  // Handle URL-based navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section') as DashboardSection | null;
    if (section && ['availability', 'bookings', 'profile'].includes(section)) {
      setActiveSection(section);
    } else {
      setActiveSection('overview');
    }
  }, [location.search]);

  // Update URL when section changes
  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    navigate(`/tutor?section=${section}`, { replace: true });
  };
  
  // Fetch user profile and tutor-specific profile
  useEffect(() => {
    const fetchGeneralProfile = async () => {
      if (currentUser?.userId) {
        const result = await ProfileService.getProfileByUserId(currentUser.userId);
        if (result.success && result.data) {
          setUserProfile(result.data);
        } else {
          console.error("Failed to fetch general user profile for dashboard:", result.error);
        }
      }
    };

    const fetchTutorDisplayProfileData = async (showLoading = true) => {
      if (currentUser?.userId) {
        if (showLoading) setLoading(true);
        const result = await TutorProfileService.getTutorProfileByUserId(currentUser.userId);
        if (result.success && result.data) {
          // Fetch skills separately and merge
          const skillsResult = await UserSkillService.getUserSkills(currentUser.userId);
          if (skillsResult.success && skillsResult.data) {
            setTutorDisplayProfile({ ...result.data, skills: skillsResult.data });
          } else {
            console.warn(`Failed to fetch skills for tutor ${currentUser.userId}:`, skillsResult.error);
            setTutorDisplayProfile({ ...result.data, skills: [] }); // Set skills to empty array on error
          }
        } else {
          console.error("Failed to fetch tutor display profile for dashboard:", result.error);
          setTutorDisplayProfile(null);
        }
        if (showLoading) setLoading(false);
      }
    };

    if (activeSection === 'overview') {
      fetchGeneralProfile();
    }

    if (activeSection === 'profile') {
      fetchTutorDisplayProfileData();
    } else {
      setTutorDisplayProfile(null);
      setIsEditingProfile(false); // Reset edit mode if navigating away from profile
    }
  }, [currentUser, activeSection]);

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

  const handleEditProfile = () => setIsEditingProfile(true);
  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    // Optionally re-fetch to discard any optimistic updates or ensure data consistency
    if (currentUser?.userId && activeSection === 'profile') {
      // Re-fetch without global loading indicator if preferred
      const fetchTutorDisplayProfileData = async (showLoading = true) => {
        if (currentUser?.userId) {
          if (showLoading) setLoading(true); // Or a more specific loading state
          const result = await TutorProfileService.getTutorProfileByUserId(currentUser.userId);
          if (result.success && result.data) {
            const skillsResult = await UserSkillService.getUserSkills(currentUser.userId);
            if (skillsResult.success && skillsResult.data) {
              setTutorDisplayProfile({ ...result.data, skills: skillsResult.data });
            } else {
              setTutorDisplayProfile({ ...result.data, skills: [] });
            }
          } else {
            setTutorDisplayProfile(null);
          }
          if (showLoading) setLoading(false);
        }
      };
      fetchTutorDisplayProfileData(false);
    }
  };

  const handleSaveProfile = async (data: CreateTutorProfileDto | UpdateTutorProfileDto) => {
    if (!currentUser?.userId) {
      console.error("User ID is missing.");
      return;
    }
    setIsSavingProfile(true);
    const { skillIds, ...profileData } = data;

    try {
      let profileResult;
      if (tutorDisplayProfile && tutorDisplayProfile.bioID) { // Existing profile
        profileResult = await TutorProfileService.updateTutorProfile(tutorDisplayProfile.bioID, profileData as UpdateTutorProfileDto);
      } else { // New profile
        profileResult = await TutorProfileService.createTutorProfile(profileData as CreateTutorProfileDto);
      }

      if (profileResult.success && profileResult.data) {
        // Manage skills
        const currentSkillsResult = await UserSkillService.getUserSkills(currentUser.userId);
        const newSkillIds = skillIds || [];

        if (currentSkillsResult.success && currentSkillsResult.data) {
          const currentSkills = currentSkillsResult.data;
          const currentSkillIdsOnRecord = currentSkills.map(us => us.skill.skillID);

          // Skills to delete
          const skillsToDelete = currentSkills.filter(us => !newSkillIds.includes(us.skill.skillID));
          for (const userSkillToDelete of skillsToDelete) {
            if (userSkillToDelete.userSkillID) {
              await UserSkillService.deleteUserSkill(userSkillToDelete.userSkillID);
            }
          }

          // Skills to add
          const skillsToAdd = newSkillIds.filter(id => !currentSkillIdsOnRecord.includes(id));
          for (const skillIdToAdd of skillsToAdd) {
            await UserSkillService.addUserSkill({ userID: currentUser.userId, skillID: skillIdToAdd, isTutor: true });
          }
        } else { // No existing skills, add all new ones
          for (const skillIdToAdd of newSkillIds) {
            await UserSkillService.addUserSkill({ userID: currentUser.userId, skillID: skillIdToAdd, isTutor: true });
          }
        }

        // Re-fetch profile data to show updated info
        const fetchTutorDisplayProfileData = async (showLoading = true) => {
            if (currentUser?.userId) {
              if (showLoading) setLoading(true);
              const result = await TutorProfileService.getTutorProfileByUserId(currentUser.userId);
              if (result.success && result.data) {
                const skillsResult = await UserSkillService.getUserSkills(currentUser.userId);
                if (skillsResult.success && skillsResult.data) {
                  setTutorDisplayProfile({ ...result.data, skills: skillsResult.data });
                } else {
                  setTutorDisplayProfile({ ...result.data, skills: [] });
                }
              } else {
                setTutorDisplayProfile(null);
              }
              if (showLoading) setLoading(false);
            }
          };
        await fetchTutorDisplayProfileData(false); // Re-fetch without global loading
        setIsEditingProfile(false);
      } else {
        console.error('Failed to save tutor profile:', profileResult.error);
        // Handle error display to user if necessary
      }
    } catch (err) {
      console.error('An unknown error occurred while saving tutor profile:', err);
    }
    setIsSavingProfile(false);
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
      <TutorSidebar
        onAvailabilityClick={() => handleSectionChange('availability')}
        onBookingsClick={() => handleSectionChange('bookings')}
        onProfileClick={() => handleSectionChange('profile')} // Added
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden"> {/* Added overflow-hidden */}
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">
                  {activeSection === 'overview' && 'Dashboard'}
                  {activeSection === 'availability' && 'Manage Availability'}
                  {activeSection === 'bookings' && 'Manage Bookings'}
                  {activeSection === 'profile' && 'Manage Tutor Profile'}
                </h1>
                <p className="text-gray-400 mt-1 text-sm lg:text-base">
                  {activeSection === 'overview' && "Welcome back! Here's your tutoring overview."}
                  {activeSection === 'availability' && "Set your available time slots for tutoring sessions."}
                  {activeSection === 'bookings' && "Review and manage your tutoring sessions."}
                  {activeSection === 'profile' && "Update your tutor specific details and skills."}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Buttons removed as per requirement */}
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
                  onClick={() => handleSectionChange('bookings')}
                  variant="outline"
                  className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Manage Bookings
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                >
                  <Link to="/tutor?section=profile">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Tutor Profile
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
          ) : activeSection === 'availability' ? (
            /* Availability Management Section */
            <ManageAvailabilitySection />
          ) : activeSection === 'bookings' ? (
            /* Bookings Management Section */
            <ManageBookingsSection />
          ) : activeSection === 'profile' && currentUser ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                    Your Tutor Profile
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {isEditingProfile ? "Update your details below." : "View and manage your public tutor information."}
                  </CardDescription>
                </div>
                {!isEditingProfile && tutorDisplayProfile && (
                  <Button onClick={handleEditProfile} variant="outline" size="sm" className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {loading && !tutorDisplayProfile && !isEditingProfile ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="ml-3 text-gray-400">Loading profile...</p>
                  </div>
                ) : isEditingProfile ? (
                  <TutorProfileForm
                    initialData={tutorDisplayProfile}
                    onSubmit={handleSaveProfile}
                    onCancel={handleCancelEditProfile}
                    isLoading={isSavingProfile}
                  />
                ) : tutorDisplayProfile ? (
                  <TutorProfileDisplay tutorProfile={tutorDisplayProfile} />
                ) : (
                  // Not loading, not editing, and no profile data
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Tutor Profile Not Found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      It seems you haven't set up your tutor profile yet. Create one to start attracting students.
                    </p>
                    <Button onClick={handleEditProfile} size="lg" className="mt-4">
                      <PlusCircle className="mr-2 h-5 w-5" /> Create Your Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default TutorDashboardPage;