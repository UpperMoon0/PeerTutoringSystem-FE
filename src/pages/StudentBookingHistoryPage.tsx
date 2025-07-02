import React, { useEffect, useState, useCallback } from 'react';
import { BookingService } from '@/services/BookingService';
import { ReviewService } from '@/services/ReviewService';
import { SessionService } from '@/services/SessionService';
import type { Booking, StudentBookingHistoryParams } from '@/types/booking.types';
import type { Session } from '@/types/session.types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { BookingDetailModal } from '@/components/booking/BookingDetailModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SubmitReviewForm from '@/components/reviews/SubmitReviewForm';
import {
  BookOpen,
  CalendarDays,
  Clock,
  User,
  Eye,
  Filter,
  AlertCircle,
  ListChecks,
  Star,
  Bell,
  MessageSquareHeart
} from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

type BookingStatusFilter = 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';

interface BookingWithSession extends Booking {
  session?: Session;
}

const StudentBookingHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingWithSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>(undefined);

  const [selectedBooking, setSelectedBooking] = useState<BookingWithSession | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Review-related state
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<BookingWithSession | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());

  const pageSize = 10;

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Confirmed': return 'default';
      case 'Cancelled':
      case 'Rejected': return 'destructive';
      case 'Completed': return 'outline'; 
      default: return 'secondary';
    }
  };

  const fetchBookingHistory = useCallback(async () => {
    if (!currentUser) {
      setError('You must be logged in to view your booking history.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    const params: StudentBookingHistoryParams = {
      page: currentPage,
      pageSize: pageSize,
    };

    params.status = statusFilter === 'All' ? undefined : statusFilter;
    if (dateRangeFilter?.from) {
      params.startDate = dateRangeFilter.from.toISOString();
    }
    if (dateRangeFilter?.to) {
      params.endDate = dateRangeFilter.to.toISOString();
    }

    try {
      const response = await BookingService.getStudentBookingHistory(params);
      if (response.success && response.data) {
        const fetchedBookings = response.data.bookings;
        
        // Fetch session details for confirmed and completed bookings
        const bookingsWithSessions: BookingWithSession[] = await Promise.all(
          fetchedBookings.map(async (booking) => {
            if (booking.status === 'Confirmed' || booking.status === 'Completed') {
              try {
                const sessionResponse = await SessionService.getSessionByBookingId(booking.bookingId);
                if (sessionResponse.success && sessionResponse.data) {
                  return {
                    ...booking,
                    session: sessionResponse.data
                  };
                }
              } catch (sessionError) {
                console.warn(`Failed to fetch session for booking ${booking.bookingId}:`, sessionError);
              }
            }
            return booking;
          })
        );
        
        setBookings(bookingsWithSessions);
        setTotalPages(Math.ceil(response.data.totalCount / response.data.pageSize));
        setTotalBookings(response.data.totalCount);
        setCurrentPage(response.data.page);

        // Check which completed bookings already have reviews
        const completedBookings = bookingsWithSessions.filter(booking => booking.status === 'Completed');
        const reviewChecks = await Promise.allSettled(
          completedBookings.map(booking =>
            ReviewService.checkReviewExistsForBooking(booking.bookingId)
          )
        );

        const newReviewedBookings = new Set<string>();
        reviewChecks.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success && result.value.data) {
            newReviewedBookings.add(completedBookings[index].bookingId);
          }
        });
        setReviewedBookings(newReviewedBookings);
      } else {
        const errorMessage = typeof response.error === 'string' ? response.error : (response.error as { message?: string })?.message || 'Failed to fetch booking history.';
        setError(errorMessage);
        setBookings([]);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'An unexpected error occurred.');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, currentPage, statusFilter, dateRangeFilter]);

  useEffect(() => {
    fetchBookingHistory();
  }, [fetchBookingHistory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as BookingStatusFilter);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const handleDateRangeFilterChange = (range: DateRange | undefined) => {
    setDateRangeFilter(range);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleViewDetails = (booking: BookingWithSession) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedBooking(null);
  };

  const handleBookingCancelled = () => {
    toast.success("Booking cancelled successfully.");
    fetchBookingHistory(); // Refresh the list
    handleModalClose();
  };

  const handleLeaveReview = (booking: BookingWithSession) => {
    setSelectedBookingForReview(booking);
    setIsReviewModalOpen(true);
  };

  const handleReviewModalClose = () => {
    setIsReviewModalOpen(false);
    setSelectedBookingForReview(null);
  };

  const handleReviewSubmitted = () => {
    if (selectedBookingForReview) {
      // Add the booking to the reviewed set
      setReviewedBookings(prev => new Set(prev).add(selectedBookingForReview.bookingId));
      toast.success("Review submitted successfully!");
    }
    handleReviewModalClose();
  };

  const canLeaveReview = (booking: BookingWithSession): boolean => {
    return booking.status === 'Completed' && !reviewedBookings.has(booking.bookingId);
  };

  // Get count of completed bookings without reviews
  const pendingReviewsCount = bookings.filter(canLeaveReview).length;

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Please log in to view your booking history.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <ListChecks className="w-8 h-8 mr-3 text-primary" />
          My Booking History
        </h1>
        <p className="text-muted-foreground mt-1">Review your past and upcoming tutoring sessions.</p>
      </header>

      {/* Pending Reviews Notification */}
      {!isLoading && pendingReviewsCount > 0 && (
        <Alert className="bg-accent/20 border-accent/50 mb-6">
          <Bell className="h-5 w-5 text-accent-foreground" />
          <AlertTitle className="text-accent-foreground font-semibold flex items-center">
            <MessageSquareHeart className="w-4 h-4 mr-1" />
            Review Pending Sessions
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            You have <span className="font-bold text-primary">{pendingReviewsCount}</span> completed session{pendingReviewsCount !== 1 ? 's' : ''} waiting for your review.
            <span className="block mt-1 text-sm">
              Help other students by sharing your experience with your tutors! ⭐
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-foreground flex items-center">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              Filters
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-48 bg-input border-border text-foreground">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="All" className="text-popover-foreground hover:bg-accent">All Statuses</SelectItem>
                  <SelectItem value="Pending" className="text-popover-foreground hover:bg-accent">Pending</SelectItem>
                  <SelectItem value="Confirmed" className="text-popover-foreground hover:bg-accent">Confirmed</SelectItem>
                  <SelectItem value="Completed" className="text-popover-foreground hover:bg-accent">Completed</SelectItem>
                  <SelectItem value="Cancelled" className="text-popover-foreground hover:bg-accent">Cancelled</SelectItem>
                  <SelectItem value="Rejected" className="text-popover-foreground hover:bg-accent">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <DatePickerWithRange
                date={dateRangeFilter}
                onDateChange={handleDateRangeFilterChange}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-accent rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No bookings found.</p>
              <p className="text-muted-foreground mt-1">
                {statusFilter === 'All' && !dateRangeFilter
                  ? 'You haven’t made any bookings yet.'
                  : 'No bookings match your current filters.'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">Showing {bookings.length} of {totalBookings} bookings.</p>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-accent/50">
                    <TableHead className="text-muted-foreground">Tutor</TableHead>
                    <TableHead className="text-muted-foreground">Topic/Skill</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow
                      key={booking.bookingId}
                      className={`border-border hover:bg-accent/50 cursor-pointer transition-colors ${
                        canLeaveReview(booking)
                          ? 'bg-gradient-to-r from-chart-1/20 to-transparent border-l-4 border-l-chart-1'
                          : ''
                      }`}
                      onClick={() => handleViewDetails(booking)}
                    >
                      <TableCell className="text-foreground font-medium">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-muted-foreground" />
                          <div>
                            <div>{booking.tutorName || 'N/A'}</div>
                            {(booking.status === 'Confirmed' || booking.status === 'Completed') && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Session with {booking.tutorName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div>
                          <div>{booking.topic}</div>
                          {(booking.status === 'Confirmed' || booking.status === 'Completed') && booking.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {booking.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center">
                          <CalendarDays className="w-4 h-4 mr-1.5 text-muted-foreground" />
                          {format(new Date(booking.sessionDate || booking.startTime), 'MMM dd, yyyy')}
                        </div>
                        {(booking.status === 'Confirmed' || booking.status === 'Completed') && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Session Date
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-muted-foreground" />
                          {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                        </div>
                        {(booking.status === 'Confirmed' || booking.status === 'Completed') && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Duration: {Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60))} min
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                              {booking.status}
                            </Badge>
                            {canLeaveReview(booking) && (
                              <Badge variant="outline" className="text-chart-1 border-chart-1 animate-pulse">
                                <Star className="w-3 h-3 mr-1" />
                                Review Needed
                              </Badge>
                            )}
                          </div>
                          {(booking.status === 'Confirmed' || booking.status === 'Completed') && (
                            <div className="text-xs text-muted-foreground">
                              {booking.status === 'Confirmed' ? 'Ready to start' : 'Session ended'}
                            </div>
                          )}
                          {canLeaveReview(booking) && (
                            <div className="text-xs text-chart-1 font-medium">
                              📝 Click to leave a review
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 hover:bg-accent/50"
                            onClick={(e) => { e.stopPropagation(); handleViewDetails(booking); }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {canLeaveReview(booking) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-chart-1 hover:text-chart-1/80 hover:bg-chart-1/20 border border-chart-1/30 animate-pulse hover:animate-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeaveReview(booking);
                              }}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Leave Review
                            </Button>
                          )}
                        </div>
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
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                        className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} text-muted-foreground hover:text-foreground hover:bg-accent border-border`}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                          isActive={currentPage === i + 1}
                          className="text-muted-foreground hover:text-foreground hover:bg-accent border-border data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
                        className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} text-muted-foreground hover:text-foreground hover:bg-accent border-border`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={isDetailModalOpen}
          onClose={handleModalClose}
          onBookingCancelled={handleBookingCancelled}
        />
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Leave a Review</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Share your experience with {selectedBookingForReview.tutorName} for the session on {format(new Date(selectedBookingForReview.sessionDate || selectedBookingForReview.startTime), 'MMM dd, yyyy')}.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <SubmitReviewForm
                bookingId={selectedBookingForReview.bookingId}
                tutorId={selectedBookingForReview.tutorId}
                studentId={selectedBookingForReview.studentId}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StudentBookingHistoryPage;