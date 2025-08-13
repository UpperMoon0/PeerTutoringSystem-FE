import React, { useCallback, useState } from 'react';
import { BookingService } from '@/services/BookingService';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { BookingList } from '@/components/booking/BookingList';
import type { Booking } from '@/types/booking.types';
import { Button } from '../ui/button';
import { Star } from 'lucide-react';
import { ReviewService } from '@/services/ReviewService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ReviewDto } from '@/types/review.types';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';

type BookingStatus = 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Rejected';

const ManageBookingsSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [key, setKey] = useState(0); // Used to force re-fetch in BookingList
  const [selectedReview, setSelectedReview] = useState<ReviewDto | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchTutorBookings = useCallback(
    (status: BookingStatus, page: number, pageSize: number) => {
      const statusFilter = status === 'All' ? 'All' : status;
      return BookingService.getTutorBookings(statusFilter, page, pageSize);
    },
    []
  );

  const handleBookingUpdate = () => {
    setKey(prevKey => prevKey + 1);
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

  const renderAdditionalActions = (booking: Booking) => {
    if (booking.status === 'Completed') {
      // This is a simplified check. A more robust implementation
      // would involve checking if a review exists for the booking.
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewReview(booking.bookingId)}
          className="text-primary hover:bg-muted hover:text-primary-foreground"
        >
          <Star className="w-4 h-4 mr-1" />
          View Review
        </Button>
      );
    }
    return null;
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

  return (
    <>
      <BookingList
        key={key}
        fetchBookings={fetchTutorBookings}
        userRole="tutor"
        title="Your Bookings"
        onBookingUpdate={handleBookingUpdate}
        additionalActions={renderAdditionalActions}
      />
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
    </>
  );
};

export default ManageBookingsSection;