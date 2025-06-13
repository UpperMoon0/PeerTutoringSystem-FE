import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/layout/AdminSidebar';
import TutorVerificationSection from '@/components/admin/TutorVerificationSection';
import ManageUsersSection from '@/components/admin/ManageUsersSection';
import ManageSkillsSection from '@/components/admin/ManageSkillsSection';
import {
  Shield,
  Users,
  ListChecks,
  Wrench,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  pendingVerifications: number;
  totalSkills: number;
  activeAdmins: number;
}

type AdminSection = 'overview' | 'tutor-verifications' | 'manage-users' | 'manage-skills';

const AdminDashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingVerifications: 0,
    totalSkills: 0,
    activeAdmins: 0
  });
  const [loading, setLoading] = useState(false);

  // Handle URL-based navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section') as AdminSection | null;
    if (section && ['tutor-verifications', 'manage-users', 'manage-skills'].includes(section)) {
      setActiveSection(section);
    } else {
      setActiveSection('overview');
    }
  }, [location.search]);

  // Update URL when section changes
  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    navigate(`/admin?section=${section}`, { replace: true });
  };

  // Load dashboard stats (mock data for now)
  useEffect(() => {
    const loadDashboardStats = () => {
      setLoading(true);
      // Mock data - replace with actual API calls
      setTimeout(() => {
        setStats({
          totalUsers: 1250,
          pendingVerifications: 12,
          totalSkills: 45,
          activeAdmins: 3
        });
        setLoading(false);
      }, 500);
    };

    if (activeSection === 'overview') {
      loadDashboardStats();
    }
  }, [activeSection]);

  const renderSection = () => {
    switch (activeSection) {
      case 'tutor-verifications':
        return <TutorVerificationSection />;
      case 'manage-users':
        return <ManageUsersSection />;
      case 'manage-skills':
        return <ManageSkillsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <AdminSidebar
        onTutorVerificationClick={() => handleSectionChange('tutor-verifications')}
        onManageUsersClick={() => handleSectionChange('manage-users')}
        onManageSkillsClick={() => handleSectionChange('manage-skills')}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">
                  {activeSection === 'overview' && 'Admin Dashboard'}
                  {activeSection === 'tutor-verifications' && 'Tutor Verifications'}
                  {activeSection === 'manage-users' && 'Manage Users'}
                  {activeSection === 'manage-skills' && 'Manage Skills'}
                </h1>
                <p className="text-gray-400 mt-1 text-sm lg:text-base">
                  {activeSection === 'overview' && "Welcome to the admin portal. Manage system operations and users."}
                  {activeSection === 'tutor-verifications' && "Review and approve tutor verification requests."}
                  {activeSection === 'manage-users' && "Manage user accounts and permissions."}
                  {activeSection === 'manage-skills' && "Manage system skills and categories."}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-950">
          {activeSection === 'overview' ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Users */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</p>
                        <p className="text-green-500 text-sm mt-1 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          +5% from last month
                        </p>
                      </div>
                      <div className="p-3 bg-blue-600 bg-opacity-20 rounded-lg">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Verifications */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Pending Verifications</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.pendingVerifications}</p>
                        <p className="text-yellow-500 text-sm mt-1 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Requires attention
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-600 bg-opacity-20 rounded-lg">
                        <ListChecks className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Skills */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Total Skills</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.totalSkills}</p>
                        <p className="text-green-500 text-sm mt-1 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Well managed
                        </p>
                      </div>
                      <div className="p-3 bg-purple-600 bg-opacity-20 rounded-lg">
                        <Wrench className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Admins */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Active Admins</p>
                        <p className="text-3xl font-bold text-white mt-2">{stats.activeAdmins}</p>
                        <p className="text-green-500 text-sm mt-1 flex items-center">
                          <UserCheck className="w-4 h-4 mr-1" />
                          System secure
                        </p>
                      </div>
                      <div className="p-3 bg-red-600 bg-opacity-20 rounded-lg">
                        <Shield className="w-6 h-6 text-red-400" />
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
                      <Shield className="w-5 h-5 mr-2 text-red-400" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage system operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => handleSectionChange('tutor-verifications')}
                      className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                    >
                      <ListChecks className="w-4 h-4 mr-2" />
                      Review Verifications
                    </Button>
                    <Button
                      onClick={() => handleSectionChange('manage-users')}
                      variant="outline"
                      className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button
                      onClick={() => handleSectionChange('manage-skills')}
                      variant="outline"
                      className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      Manage Skills
                    </Button>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                        System Status
                      </span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        All Systems Operational
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Current system health and alerts
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
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-600 bg-opacity-20 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Database Connection</p>
                              <p className="text-gray-400 text-sm">All connections healthy</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Healthy
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-yellow-600 bg-opacity-20 rounded-lg">
                              <AlertCircle className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Pending Verifications</p>
                              <p className="text-gray-400 text-sm">{stats.pendingVerifications} requests awaiting review</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            Attention
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-600 bg-opacity-20 rounded-lg">
                              <Shield className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">Security Status</p>
                              <p className="text-gray-400 text-sm">No security alerts</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Secure
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            renderSection()
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
