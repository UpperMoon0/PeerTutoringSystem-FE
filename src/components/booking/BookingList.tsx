import React, { useEffect, useState, useCallback } from 'react';
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
import { BookingDetailModal } from '@/components/booking/BookingDetailModal';
import {
  BookOpen,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  XCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { getStatusBadgeVariant, getStatusString } from '@/lib/utils';

type BookingStatus = 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';
type SortOrder = 'asc' | 'desc';
interface BookingListProps {
  fetchBookings: (status: BookingStatus, page: number, pageSize: number, sortOrder?: SortOrder) => Promise<ApiResult<{ bookings: Booking[], totalCount: number }>>;
  userRole: 'tutor' | 'admin';
  title: string;
  subtitle?: string;
  additionalActions?: (booking: Booking) => React.ReactNode;
  onBookingUpdate: () => void;
  showStats?: boolean;
  itemPerPage?: number;
}

export const BookingList: React.FC<BookingListProps> = ({
  fetchBookings: fetchBookingsProp,
  userRole,
  title,
  subtitle,
  additionalActions,
  onBookingUpdate,
  showStats = true,
  itemPerPage = 10,
}) => {
  useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [sortOrder] = useState<SortOrder>('desc');

  const pageSize = itemPerPage;

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchBookingsProp(selectedStatus, currentPage, pageSize, sortOrder);
      if (response.success && response.data) {
        setBookings(response.data.bookings);
        setTotalPages(Math.ceil(response.data.totalCount / pageSize));
        setTotalCount(response.data.totalCount);
      } else {
        setError(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to fetch bookings.');
        setBookings([]);
        setTotalCount(0);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to fetch bookings.');
      setBookings([]);
      setTotalCount(0);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBookingsProp, selectedStatus, currentPage, pageSize]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: BookingStatus) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const getStatusStats = () => {
    // Note: This calculates stats based on the current page's bookings.
    // For system-wide stats, an aggregate API call would be needed.
    // However, for simplicity, we'll use the totalCount for the main stat.
    const stats = {
      total: totalCount,
      pending: bookings.filter(b => getStatusString(b.status) === 'Pending').length,
      confirmed: bookings.filter(b => getStatusString(b.status) === 'Confirmed').length,
      completed: bookings.filter(b => getStatusString(b.status) === 'Completed').length,
      rejected: bookings.filter(b => getStatusString(b.status) === 'Rejected').length,
      cancelled: bookings.filter(b => getStatusString(b.status) === 'Cancelled').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {subtitle && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      )}

      {showStats && (
        <div className="space-y-4">
          <div className="grid grid-cols-1">
              <Card className="bg-card border-border">
                  <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-muted-foreground text-sm font-medium">Total Bookings</p>
                              <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
                          </div>
                          <div className="p-2 bg-primary/10 rounded-lg">
                              <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-card border-border">
                  <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-muted-foreground text-sm font-medium">Pending</p>
                              <p className="text-2xl font-bold text-foreground mt-1">{stats.pending}</p>
                          </div>
                          <div className="p-2 bg-yellow-400/10 rounded-lg">
                              <Clock className="w-5 h-5 text-yellow-400" />
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="bg-card border-border">
                  <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-muted-foreground text-sm font-medium">Confirmed</p>
                              <p className="text-2xl font-bold text-foreground mt-1">{stats.confirmed}</p>
                          </div>
                          <div className="p-2 bg-primary/10 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-primary" />
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="bg-card border-border">
                  <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-muted-foreground text-sm font-medium">Completed</p>
                              <p className="text-2xl font-bold text-foreground mt-1">{stats.completed}</p>
                          </div>
                          <div className="p-2 bg-muted/10 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-muted-foreground" />
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="bg-card border-border">
                  <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-muted-foreground text-sm font-medium">Rejected</p>
                              <p className="text-2xl font-bold text-foreground mt-1">{stats.rejected}</p>
                          </div>
                          <div className="p-2 bg-destructive/10 rounded-lg">
                              <AlertCircle className="w-5 h-5 text-destructive" />
                          </div>
                      </div>
                  </CardContent>
              </Card>
              <Card className="bg-card border-border">
                  <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-muted-foreground text-sm font-medium">Cancelled</p>
                              <p className="text-2xl font-bold text-foreground mt-1">{stats.cancelled}</p>
                          </div>
                          <div className="p-2 bg-destructive/10 rounded-lg">
                              <XCircle className="w-5 h-5 text-destructive" />
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
      )}

      {/* Bookings Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              {title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedStatus} onValueChange={(value: BookingStatus) => handleStatusFilter(value)}>
                <SelectTrigger className="w-40 bg-input border-border text-foreground">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-destructive/10 border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-destructive-foreground">Error</AlertTitle>
              <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings found</p>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedStatus === 'All'
                  ? 'No bookings match the current criteria.'
                  : `No ${selectedStatus.toLowerCase()} bookings found`}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead className="text-muted-foreground">Student</TableHead>
                    {userRole === 'admin' && <TableHead className="text-muted-foreground">Tutor</TableHead>}
                    <TableHead className="text-muted-foreground">Topic</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const isHighlighted =
                      userRole === 'tutor' &&
                      getStatusString(booking.status) === 'Confirmed' &&
                      !booking.session;

                    return (
                    <TableRow
                      key={booking.bookingId}
                      className={`border-border hover:bg-accent ${
                        isHighlighted ? 'bg-yellow-100/50 border-l-4 border-l-yellow-500 animate-pulse' : ''
                      }`}
                    >
                      <TableCell className="text-foreground">{booking.studentName || 'N/A'}</TableCell>
                      {userRole === 'admin' && <TableCell className="text-foreground">{booking.tutorName || 'N/A'}</TableCell>}
                      <TableCell className="text-foreground">{booking.topic}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                            {getStatusString(booking.status)}
                          </Badge>
                          {isHighlighted && (
                            <Badge variant="destructive" className="animate-none">
                              Missing Session
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(booking)}
                            className="text-primary hover:bg-muted hover:text-primary-foreground"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {additionalActions && additionalActions(booking)}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                        className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} text-muted-foreground hover:text-foreground hover:bg-muted border-border`}
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
                          className="text-muted-foreground hover:text-foreground hover:bg-muted border-border data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
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
                        className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} text-muted-foreground hover:text-foreground hover:bg-muted border-border`}
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
            onBookingUpdate();
            setIsDetailModalOpen(false);
          }}
          onUpdateStatus={() => {
            onBookingUpdate();
            setIsDetailModalOpen(false);
          }}
          userRole={userRole}
        />
      )}
    </div>
  );
};