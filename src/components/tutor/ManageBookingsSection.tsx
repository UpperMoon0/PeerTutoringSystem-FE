import React, { useEffect, useState, useCallback } from 'react';
import { BookingService } from '@/services/BookingService';
import { SessionService } from '@/services/SessionService';
import { ReviewService } from '@/services/ReviewService';
import type { Booking } from '@/types/booking.types';
import type { CreateSessionDto, UpdateSessionDto } from '@/types/session.types';
import type { ReviewDto } from '@/types/review.types';
import type { ApiResult } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SessionForm from '@/components/session/SessionForm';
import { BookingDetailModal } from '@/components/booking/BookingDetailModal';
import {
  BookOpen,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Star,
  MessageSquare
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
  
  // Review-related state
  const [bookingsWithReviews, setBookingsWithReviews] = useState<Set<string>>(new Set());
  const [selectedReview, setSelectedReview] = useState<ReviewDto | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
  const pageSize = 10;

  const fetchBookings = useCallback(async () => {
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
        const fetchedBookings = response.data.bookings;
        setBookings(fetchedBookings);
        setTotalPages(Math.ceil(response.data.totalCount / pageSize));
        
        // Check which completed bookings have reviews
        const completedBookings = fetchedBookings.filter(booking => booking.status === 'Completed');
        const reviewChecks = await Promise.allSettled(
          completedBookings.map(booking =>
            ReviewService.checkReviewExistsForBooking(booking.bookingId)
          )
        );

        const newBookingsWithReviews = new Set<string>();
        reviewChecks.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success && result.value.data) {
            newBookingsWithReviews.add(completedBookings[index].bookingId);
          }
        });
        setBookingsWithReviews(newBookingsWithReviews);
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
  }, [currentUser, selectedStatus, currentPage, pageSize, setBookings, setTotalPages, setError, setIsLoading, setBookingsWithReviews]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'Tutor') {
      fetchBookings();
    }
  }, [currentUser, currentPage, selectedStatus, fetchBookings]);

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
            // Log the error but don't prevent showing the booking details
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

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    if (!bookingId || isUpdating) return;
  
    const bookingToUpdate = bookings.find(b => b.bookingId === bookingId);
  
    if (newStatus === 'Confirmed' && bookingToUpdate) {
      setSelectedBooking(bookingToUpdate);
      setIsSessionFormOpen(true);
      return;
    }
  
    setIsUpdating(true);
    setError(null);
    try {
      const result: ApiResult<Booking> = await BookingService.updateBookingStatus(bookingId, newStatus);
      if (result.success && result.data) {
        // Optimistically update the booking in the list
        setBookings(prevBookings =>
          prevBookings.map(b => (b.bookingId === bookingId ? { ...b, status: newStatus } : b))
        );
        if (isDetailModalOpen) {
          setSelectedBooking(result.data);
        }
        fetchBookings();
      } else {
        setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to update booking status.');
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'An unexpected error occurred while updating status.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSessionCreation = async (sessionData: CreateSessionDto | UpdateSessionDto) => {
    if (!selectedBooking) return;
  
    const createDto = sessionData as CreateSessionDto;
  
    setIsUpdating(true);
    setSessionError(null);
    try {
      // Step 1: Confirm the booking
      const bookingResult = await BookingService.updateBookingStatus(selectedBooking.bookingId, 'Confirmed');
      if (!bookingResult.success || !bookingResult.data) {
        throw new Error(typeof bookingResult.error === 'string' ? bookingResult.error : bookingResult.error?.message || 'Failed to confirm booking. Please try again.');
      }
  
      // Step 2: Create the session
      try {
        const sessionResult = await SessionService.createSession(createDto);
        if (!sessionResult.success) {
          // If session creation fails, revert the booking status to 'Pending'
          await BookingService.updateBookingStatus(selectedBooking.bookingId, 'Pending');
          throw new Error(typeof sessionResult.error === 'string' ? sessionResult.error : sessionResult.error?.message || 'Failed to create session. The booking status has been reverted.');
        }
  
        // On success, update UI and refresh data
        setSelectedBooking(bookingResult.data);
        setIsSessionFormOpen(false);
        setIsDetailModalOpen(false);
        fetchBookings();
      } catch (sessionError) {
        // This catch block handles session creation failure and the subsequent booking status reversion.
        // The error from this block will be displayed to the user.
        throw sessionError;
      }
  
    } catch (err: unknown) {
      setSessionError((err as Error)?.message || 'An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewReview = async (bookingId: string) => {
    setReviewError(null);
    try {
      const response = await ReviewService.getReviewByBookingId(bookingId);
      if (response.success && response.data) {
        setSelectedReview(response.data);
        setIsReviewModalOpen(true);
      } else {
        setReviewError('Failed to fetch review details.');
      }
    } catch (err: unknown) {
      setReviewError((err as Error)?.message || 'An unexpected error occurred while fetching review.');
      console.error(err);
    }
  };

  const hasReview = (bookingId: string): boolean => {
    return bookingsWithReviews.has(bookingId);
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
      rejected: bookings.filter(b => b.status === 'Rejected').length,
      cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    };
    return stats;
  };

  if (!currentUser || currentUser.role !== 'Tutor') {
    return (
      <div className="p-6 text-center">
        <Alert className="bg-card border-border">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-foreground">Access Denied</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Only tutors can manage bookings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Booking Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
      </div>

      {/* Bookings Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary" />
              Your Bookings
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
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-accent rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings found</p>
              <p className="text-muted-foreground text-sm mt-1">
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
                  <TableRow className="border-border hover:bg-muted">
                    <TableHead className="text-muted-foreground">Student</TableHead>
                    <TableHead className="text-muted-foreground">Topic</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.bookingId} className="border-border hover:bg-accent">
                      <TableCell className="text-foreground">{booking.studentName || 'N/A'}</TableCell>
                      <TableCell className="text-foreground">{booking.topic}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(booking.bookingId)}
                            className="text-primary hover:bg-muted hover:text-primary-foreground"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {booking.status === 'Completed' && hasReview(booking.bookingId) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReview(booking.bookingId)}
                              className="text-primary hover:bg-muted hover:text-primary-foreground"
                            >
                              <Star className="w-4 h-4 mr-1" />
                              View Review
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
            fetchBookings(); // Refresh the list
            setIsDetailModalOpen(false);
          }}
          onUpdateStatus={(status) => {
            handleUpdateStatus(selectedBooking.bookingId, status as Booking['status']);
            setIsDetailModalOpen(false);
          }}
          userRole="tutor"
        />
      )}

      {/* Session Creation Modal */}
      <Dialog open={isSessionFormOpen} onOpenChange={setIsSessionFormOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Accept Booking & Create Session</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Provide session details to complete the booking acceptance.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <SessionForm
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
              className="bg-muted border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Display Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center">
              <Star className="w-5 h-5 mr-2 text-primary" />
              Student Review
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review left by the student for this tutoring session.
            </DialogDescription>
          </DialogHeader>

          {reviewError && (
            <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{reviewError}</AlertDescription>
            </Alert>
          )}

          {selectedReview && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Rating</h3>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= selectedReview.rating
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-foreground font-medium">
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>

              {selectedReview.comment && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Comment
                  </h3>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedReview.comment}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Reviewed on: {format(new Date(selectedReview.reviewDate), 'MMM dd, yyyy')}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReviewModalOpen(false);
                setSelectedReview(null);
                setReviewError(null);
              }}
              className="bg-muted border-border text-foreground hover:bg-muted"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBookingsSection;