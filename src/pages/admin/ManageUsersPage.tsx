import React, { useEffect, useState, useMemo } from 'react';
import { AdminUserService } from '@/services/AdminUserService';
import type { User } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ban, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';

const ManageUsersPage: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actingUserId, setActingUserId] = useState<string | null>(null);

  const { accessToken: token } = useAuth();

  const fetchUsers = async () => {
    if (!token) {
      setError('Authentication token not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await AdminUserService.getAllUsers(); 
    if (result.success && result.data) {
      setAllUsers(result.data);
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to fetch users.';
      setError(errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    if (selectedRoleFilter === 'All') {
      return allUsers;
    }
    return allUsers.filter(user => user.role === selectedRoleFilter);
  }, [allUsers, selectedRoleFilter]);

  const handleBanToggle = async (userId: string, currentUserStatus: string) => {
    if (!token) {
      setActionError('Authentication token not found.');
      return;
    }
    setActingUserId(userId);
    setActionError(null);
    setActionSuccess(null);

    let result;
    if (currentUserStatus === 'Banned') {
      result = await AdminUserService.unbanUser(userId);
    } else {
      result = await AdminUserService.banUser(userId);
    }

    if (result.success) {
      setActionSuccess(`User ${userId} status has been updated successfully.`);
      await fetchUsers(); // Refresh users list
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || `Failed to update status for user ${userId}.`;
      setActionError(errorMessage);
    }
    setActingUserId(null);
  };

  if (loading && allUsers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
        <div className="w-48">
          <Select value={selectedRoleFilter} onValueChange={setSelectedRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Tutor">Tutor</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {actionError && (
        <Alert variant="destructive" className="mb-4">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Action Failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}
      {actionSuccess && (
        <Alert variant="default" className="mb-4 bg-green-100 border-green-400 text-green-700">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Action Successful</AlertTitle>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {filteredUsers.length === 0 && !loading && (
        <p className="text-center text-gray-500 text-lg">
          {selectedRoleFilter === 'All' ? 'No users found.' : `No users found with the role: ${selectedRoleFilter}`}
        </p>
      )}

      {filteredUsers.length > 0 && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Full Name</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Role</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Status</th>
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.userID} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4">{user.fullName}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'Active' ? 'bg-green-200 text-green-800' :
                        user.status === 'Banned' ? 'bg-red-200 text-red-800' :
                        'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {user.role !== 'Admin' && (
                      <Button
                        onClick={() => handleBanToggle(user.userID, user.status)}
                        variant={user.status === 'Banned' ? 'outline' : 'destructive'}
                        size="sm"
                        disabled={actingUserId === user.userID}
                        className="flex items-center justify-center"
                      >
                        {actingUserId === user.userID ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : user.status === 'Banned' ? (
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <Ban className="mr-2 h-4 w-4" />
                        )}
                        {actingUserId === user.userID
                          ? 'Processing...'
                          : user.status === 'Banned'
                          ? 'Unban'
                          : 'Ban'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
