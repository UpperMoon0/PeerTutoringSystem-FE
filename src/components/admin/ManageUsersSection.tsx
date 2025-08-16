import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { AdminService } from '@/services/AdminService';
import type { User } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ban, CheckCircle, ShieldAlert, Loader2, Info } from 'lucide-react';
import UserInfoModal from '@/components/admin/UserInfoModal';

const ManageUsersSection: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actingUserId, setActingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { accessToken: token } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError('Authentication token not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await AdminService.getAllUsers();
    if (result.success && result.data) {
      setAllUsers(result.data);
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to fetch users.';
      setError(errorMessage);
    }
    setLoading(false);
  }, [token, setError, setLoading, setAllUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      result = await AdminService.unbanUser(userId);
    } else {
      result = await AdminService.banUser(userId);
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
      <div className="flex justify-center items-center h-64 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4 bg-destructive/10 text-destructive border-destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <div className="w-48">
          <Select value={selectedRoleFilter} onValueChange={setSelectedRoleFilter}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-input text-foreground border-border">
              <SelectItem value="All">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Tutor">Tutor</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {actionError && (
        <Alert variant="destructive" className="mb-4 bg-destructive/10 text-destructive border-destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Action Failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}
      {actionSuccess && (
        <Alert variant="default" className="mb-4 bg-primary/10 border-primary text-primary">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle>Action Successful</AlertTitle>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {filteredUsers.length === 0 && !loading && (
        <p className="text-center text-muted-foreground text-lg">
          {selectedRoleFilter === 'All' ? 'No users found.' : `No users found with the role: ${selectedRoleFilter}`}
        </p>
      )}

      {filteredUsers.length > 0 && (
        <div className="overflow-x-auto bg-card border border-border shadow-lg rounded-lg">
          <table className="min-w-full">
            <thead className="bg-card text-muted-foreground">
              <tr>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Full Name</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Role</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Status</th>
                <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {filteredUsers.map((user) => (
                <tr key={user.userID} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">{user.fullName}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'Active' ? 'bg-primary/20 text-primary' :
                        user.status === 'Banned' ? 'bg-destructive/20 text-destructive' :
                        'bg-muted/20 text-muted-foreground'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        onClick={() => setSelectedUser(user)}
                        variant="outline"
                        size="sm"
                        className="bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <Info className="mr-2 h-4 w-4" /> Info
                      </Button>
                      {user.role !== 'Admin' && (
                        <Button
                          onClick={() => handleBanToggle(user.userID, user.status)}
                          variant={user.status === 'Banned' ? 'outline' : 'destructive'}
                          size="sm"
                          disabled={actingUserId === user.userID}
                          className={`flex items-center justify-center ${
                            user.status === 'Banned'
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {actingUserId === user.userID ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : user.status === 'Banned' ? (
                            <CheckCircle className="mr-2 h-4 w-4" />
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <UserInfoModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};

export default ManageUsersSection;