import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminDashboardService, type DashboardStatistics } from '@/services/AdminDashboardService';
import {
  Shield,
  Users,
  ListChecks,
  Wrench,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateToSection?: (section: string) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = () => {
  const [stats, setStats] = useState<DashboardStatistics>({
    totalUsers: 0,
    pendingVerifications: 0,
    totalSkills: 0,
    activeAdmins: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard stats from API
  useEffect(() => {
    const loadDashboardStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await AdminDashboardService.getDashboardStatistics();
        
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          const errorMessage = typeof result.error === 'string'
            ? result.error
            : result.error?.message || 'Failed to load dashboard statistics.';
          setError(errorMessage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred while loading dashboard statistics.');
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);


  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Admin Portal</h2>
        <p className="text-gray-400">Manage system operations, users, and maintain platform security.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-red-500">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State for Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 lg:p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-8 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !error ? (
        /* Stats Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <p className={`text-sm mt-1 flex items-center ${stats.pendingVerifications > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {stats.pendingVerifications > 0 ? (
                      <>
                        <Clock className="w-4 h-4 mr-1" />
                        Requires attention
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        All caught up
                      </>
                    )}
                  </p>
                </div>
                <div className={`p-3 ${stats.pendingVerifications > 0 ? 'bg-yellow-600 bg-opacity-20' : 'bg-green-600 bg-opacity-20'} rounded-lg`}>
                  <ListChecks className={`w-6 h-6 ${stats.pendingVerifications > 0 ? 'text-yellow-400' : 'text-green-400'}`} />
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
      ) : null}

      <div className="grid grid-cols-1 gap-6">
        {/* System Status */}
        <Card className="bg-gray-900 border-gray-800">
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
                    <div className={`p-2 ${stats.pendingVerifications > 0 ? 'bg-yellow-600 bg-opacity-20' : 'bg-green-600 bg-opacity-20'} rounded-lg`}>
                      {stats.pendingVerifications > 0 ? (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">Pending Verifications</p>
                      <p className="text-gray-400 text-sm">
                        {stats.pendingVerifications === 0
                          ? 'No pending verification requests'
                          : `${stats.pendingVerifications} requests awaiting review`
                        }
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={stats.pendingVerifications > 0
                      ? "text-yellow-400 border-yellow-400"
                      : "text-green-400 border-green-400"
                    }
                  >
                    {stats.pendingVerifications > 0 ? 'Attention' : 'Healthy'}
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
    </div>
  );
};

export default AdminOverview;