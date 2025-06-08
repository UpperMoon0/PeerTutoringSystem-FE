import React, { useEffect, useState } from 'react';
import { BookingService } from '@/services/BookingService';
import { SessionService } from '@/services/SessionService';
import type { Booking } from '@/types/booking.types';
import type { CreateSessionDto } from '@/types/session.types';
import type { ApiResult } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateSessionForm from '@/components/session/CreateSessionForm';
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  X,
  AlertCircle,
  TrendingUp,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type BookingStatus = 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';

const ManageBookingsSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const pageSize = 10;

  const fetchBookings = async () => {
    if (!currentUser || currentUser.role !== 'Tutor') {
      setError('You are not authorized to view this page.');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await BookingService.getTutorBookings(selectedStatus, currentPage, pageSize);
      if (response.success && response.data) {
        setBookings(response.data.bookings);
        setTotalPages(Math.ceil(response.data.totalCount / pageSize));
      } else {
        setError(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to fetch bookings.');
        setBookings([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings.');
      setBookings([]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'Tutor') {
      fetchBookings();
    }
  }, [currentUser, currentPage, selectedStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: BookingStatus) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleViewDetails = async (bookingId: string) => {
    try {
      const result: ApiResult<Booking> = await BookingService.getBookingById(bookingId);
      if (result.success && result.data) {
        if (result.data.tutorId !== currentUser?.userId) {
          setError('You are not authorized to view this booking.');
          return;
        }
        setSelectedBooking(result.data);
        setIsDetailModalOpen(true);
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to fetch booking details.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking details.');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    if (!bookingId || isUpdating) return;

    // For accepting bookings, show the session creation form instead of directly updating status
    if (newStatus === 'Confirmed') {
      setIsSessionFormOpen(true);
      return;
    }

    setIsUpdating(true);
    setError(null);
    try {
      const result: ApiResult<Booking> = await BookingService.updateBookingStatus(bookingId, newStatus);
      if (result.success && result.data) {
        setSelectedBooking(result.data);
        fetchBookings(); // Refresh the list
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to update booking status.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while updating status.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSessionCreation = async (sessionData: CreateSessionDto) => {
    if (!selectedBooking) return;

    setIsUpdating(true);
    setSessionError(null);
    try {
      // First, update booking status to Confirmed
      const bookingResult = await BookingService.updateBookingStatus(selectedBooking.bookingId, 'Confirmed');
      if (!bookingResult.success) {
        throw new Error(typeof bookingResult.error === 'string' ? bookingResult.error : bookingResult.error?.message || 'Failed to confirm booking');
      }

      // Then create the session
      const sessionResult = await SessionService.createSession(sessionData);
      if (!sessionResult.success) {
        // If session creation fails, we might want to revert the booking status
        // For now, we'll just show the error
        throw new Error(typeof sessionResult.error === 'string' ? sessionResult.error : sessionResult.error?.message || 'Failed to create session');
      }

      // Success - update UI
      if (bookingResult.data) {
        setSelectedBooking(bookingResult.data);
      }
      setIsSessionFormOpen(false);
      setIsDetailModalOpen(false);
      fetchBookings(); // Refresh the list
    } catch (err: any) {
      setSessionError(err.message || 'An unexpected error occurred while creating session.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'Confirmed':
        return 'default';
      case 'Cancelled':
      case 'Rejected':
        return 'destructive';
      case 'Completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'Pending').length,
      confirmed: bookings.filter(b => b.status === 'Confirmed').length,
      completed: bookings.filter(b => b.status === 'Completed').length,
    };
    return stats;
  };

  if (!currentUser || currentUser.role !== 'Tutor') {
    return (
      <div className="p-6 text-center">
        <Alert className="bg-gray-900 border-gray-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-white">Access Denied</AlertTitle>
          <AlertDescription className="text-gray-400">
            Only tutors can manage bookings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Manage Your Bookings</h2>
        <p className="text-gray-400">Review and manage your tutoring sessions.</p>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-600 bg-opacity-20 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-600 bg-opacity-20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Confirmed</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.confirmed}</p>
              </div>
              <div className="p-2 bg-green-600 bg-opacity-20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.completed}</p>
              </div>
              <div className="p-2 bg-purple-600 bg-opacity-20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
              Your Bookings
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={selectedStatus} onValueChange={(value: BookingStatus) => handleStatusFilter(value)}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="All" className="text-white hover:bg-gray-700">All Status</SelectItem>
                  <SelectItem value="Pending" className="text-white hover:bg-gray-700">Pending</SelectItem>
                  <SelectItem value="Confirmed" className="text-white hover:bg-gray-700">Confirmed</SelectItem>
                  <SelectItem value="Completed" className="text-white hover:bg-gray-700">Completed</SelectItem>
                  <SelectItem value="Cancelled" className="text-white hover:bg-gray-700">Cancelled</SelectItem>
                  <SelectItem value="Rejected" className="text-white hover:bg-gray-700">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-900 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-red-200">Error</AlertTitle>
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-800 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No bookings found</p>
              <p className="text-gray-500 text-sm mt-1">
                {selectedStatus === 'All' 
                  ? 'Students will appear here once they book sessions with you'
                  : `No ${selectedStatus.toLowerCase()} bookings found`
                }
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800">
                    <TableHead className="text-gray-300">Student</TableHead>
                    <TableHead className="text-gray-300">Topic</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Time</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.bookingId} className="border-gray-800 hover:bg-gray-800">
                      <TableCell className="text-white">{booking.studentName || 'N/A'}</TableCell>
                      <TableCell className="text-white">{booking.topic}</TableCell>
                      <TableCell className="text-gray-300">
                        {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(booking.bookingId)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-gray-800"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} text-gray-300 hover:text-white hover:bg-gray-800 border-gray-700`}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(i + 1);
                          }}
                          isActive={currentPage === i + 1}
                          className="text-gray-300 hover:text-white hover:bg-gray-800 border-gray-700 data-[active=true]:bg-blue-600 data-[active=true]:text-white"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} text-gray-300 hover:text-white hover:bg-gray-800 border-gray-700`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Booking Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Review and manage this booking session.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-1">Student:</h3>
                  <p className="text-white">{selectedBooking.studentName || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-300 mb-1">Status:</h3>
                  <Badge variant={getStatusBadgeVariant(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-300 mb-1">Date & Time:</h3>
                <div className="flex items-center space-x-4 text-white">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                    {format(new Date(selectedBooking.startTime), 'PPP')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-blue-400" />
                    {format(new Date(selectedBooking.startTime), 'p')} - {format(new Date(selectedBooking.endTime), 'p')}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-300 mb-1">Topic:</h3>
                <p className="text-white">{selectedBooking.topic}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-300 mb-1">Description:</h3>
                <p className="text-gray-300 bg-gray-800 p-3 rounded-lg">
                  {selectedBooking.description || 'No description provided.'}
                </p>
              </div>

              {selectedBooking.status === 'Pending' && (
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="font-semibold text-gray-300 mb-3">Actions:</h3>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleUpdateStatus(selectedBooking.bookingId, 'Confirmed')}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Processing...' : 'Accept & Create Session'}
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(selectedBooking.bookingId, 'Rejected')}
                      disabled={isUpdating}
                      variant="destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {isUpdating ? 'Rejecting...' : 'Reject Booking'}
                    </Button>
                  </div>
                </div>
              )}

              {(selectedBooking.status === 'Confirmed' && new Date(selectedBooking.endTime) < new Date()) && (
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="font-semibold text-gray-300 mb-3">Actions:</h3>
                  <Button 
                    onClick={() => handleUpdateStatus(selectedBooking.bookingId, 'Completed')} 
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isUpdating ? 'Completing...' : 'Mark as Completed'}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDetailModalOpen(false)}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Creation Modal */}
      <Dialog open={isSessionFormOpen} onOpenChange={setIsSessionFormOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Accept Booking & Create Session</DialogTitle>
            <DialogDescription className="text-gray-400">
              Provide session details to complete the booking acceptance.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <CreateSessionForm
              booking={selectedBooking}
              onSubmit={handleSessionCreation}
              isSubmitting={isUpdating}
              error={sessionError || undefined}
            />
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSessionFormOpen(false);
                setSessionError(null);
              }}
              disabled={isUpdating}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBookingsSection;