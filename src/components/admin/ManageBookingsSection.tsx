import React, { useEffect, useState } from 'react';
import { BookingService } from '@/services/BookingService';
import { SessionService } from '@/services/SessionService';
import type { Booking } from '@/types/booking.types';
import type { ApiResult } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { BookingDetailModal } from '@/components/booking/BookingDetailModal';
import {
  BookOpen,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  Users,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

type BookingStatus = 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';

interface BookingFilters {
  status: BookingStatus;
  searchTerm: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
}

const ManageBookingsSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'All',
    searchTerm: '',
    page: 1,
    pageSize: 10
  });

  const fetchBookings = async () => {
    if (!currentUser || currentUser.role !== 'Admin') {
      setError('You are not authorized to view this page.');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await BookingService.getAllBookingsForAdmin(
        filters.page,
        filters.pageSize,
        filters.status,
        filters.startDate?.toISOString(),
        filters.endDate?.toISOString(),
        filters.searchTerm
      );
      
      if (response.success && response.data) {
        setBookings(response.data.bookings);
        setTotalCount(response.data.totalCount);
        setTotalPages(Math.ceil(response.data.totalCount / filters.pageSize));
      } else {
        setError(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to fetch bookings.');
        setBookings([]);
      }
      
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch bookings.');
      setBookings([]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'Admin') {
      fetchBookings();
    }
  }, [currentUser, filters]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleStatusFilter = (status: BookingStatus) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleSearchChange = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm, page: 1 }));
  };

  const handleDateRangeChange = (startDate?: Date, endDate?: Date) => {
    setFilters(prev => ({ ...prev, startDate, endDate, page: 1 }));
  };

  const handleViewDetails = async (bookingId: string) => {
    try {
      const result: ApiResult<Booking> = await BookingService.getBookingById(bookingId);
      if (result.success && result.data) {
        let bookingWithSession = result.data;

        // Fetch session data for confirmed or completed bookings
        if (result.data.status === 'Confirmed' || result.data.status === 'Completed') {
          try {
            const sessionResult = await SessionService.getSessionByBookingId(bookingId);
            if (sessionResult.success && sessionResult.data) {
              bookingWithSession = {
                ...result.data,
                session: sessionResult.data
              };
            }
          } catch (sessionErr: unknown) {
            console.warn('Failed to fetch session data for booking:', sessionErr);
          }
        }

        setSelectedBooking(bookingWithSession);
        setIsDetailModalOpen(true);
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to fetch booking details.');
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch booking details.');
      console.error(err);
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
    const allBookings = bookings; // In real implementation, this would be all bookings without pagination
    const stats = {
      total: totalCount,
      pending: allBookings.filter(b => b.status === 'Pending').length,
      confirmed: allBookings.filter(b => b.status === 'Confirmed').length,
      completed: allBookings.filter(b => b.status === 'Completed').length,
      rejected: allBookings.filter(b => b.status === 'Rejected').length,
      cancelled: allBookings.filter(b => b.status === 'Cancelled').length,
    };
    return stats;
  };

  const clearFilters = () => {
    setFilters({
      status: 'All',
      searchTerm: '',
      startDate: undefined,
      endDate: undefined,
      page: 1,
      pageSize: 10
    });
  };

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="p-6 text-center">
        <Alert className="bg-gray-900 border-gray-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-white">Access Denied</AlertTitle>
          <AlertDescription className="text-gray-400">
            Only administrators can manage bookings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Booking Management</h2>
        <p className="text-gray-400">Monitor and manage all tutoring session bookings in the system.</p>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
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

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Cancelled</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.cancelled}</p>
              </div>
              <div className="p-2 bg-red-600 bg-opacity-20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.rejected}</p>
              </div>
              <div className="p-2 bg-gray-600 bg-opacity-20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-400" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Status</label>
              <Select value={filters.status} onValueChange={(value: BookingStatus) => handleStatusFilter(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
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

            {/* Search Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by student, tutor, or topic..."
                  value={filters.searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Date Range</label>
              <DatePickerWithRange
                date={{
                  from: filters.startDate,
                  to: filters.endDate
                }}
                onDateChange={(dateRange) => handleDateRangeChange(dateRange?.from, dateRange?.to)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Actions</label>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              All Bookings ({totalCount})
            </CardTitle>
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
                {filters.status === 'All' && !filters.searchTerm && !filters.startDate && !filters.endDate
                  ? 'No bookings have been created yet'
                  : 'No bookings match the current filters'
                }
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800">
                    <TableHead className="text-gray-300">Student</TableHead>
                    <TableHead className="text-gray-300">Tutor</TableHead>
                    <TableHead className="text-gray-300">Topic</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Time</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.bookingId} className="border-gray-800 hover:bg-gray-800">
                      <TableCell className="text-white">{booking.studentName || 'N/A'}</TableCell>
                      <TableCell className="text-white">{booking.tutorName || 'N/A'}</TableCell>
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
                      <TableCell className="text-gray-300">
                        {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
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
                          if (filters.page > 1) handlePageChange(filters.page - 1);
                        }}
                        className={`${filters.page === 1 ? 'pointer-events-none opacity-50' : ''} text-gray-300 hover:text-white hover:bg-gray-800 border-gray-700`}
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
                          isActive={filters.page === i + 1}
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
                          if (filters.page < totalPages) handlePageChange(filters.page + 1);
                        }}
                        className={`${filters.page === totalPages ? 'pointer-events-none opacity-50' : ''} text-gray-300 hover:text-white hover:bg-gray-800 border-gray-700`}
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
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onBookingCancelled={() => {
            fetchBookings();
            setIsDetailModalOpen(false);
          }}
          onUpdateStatus={() => {
            fetchBookings();
            setIsDetailModalOpen(false);
          }}
          userRole="admin"
        />
      )}
    </div>
  );
};

export default ManageBookingsSection;