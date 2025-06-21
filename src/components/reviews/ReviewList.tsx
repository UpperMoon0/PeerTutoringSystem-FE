import React from 'react';
import type { ReviewDto } from '@/types/review.types';
import ReviewCard from './ReviewCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface ReviewListProps {
  reviews: ReviewDto[];
  isLoading: boolean;
  error?: string | null;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-400">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900 border-red-700 text-red-200">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-lg">No reviews yet for this tutor.</p>
        <p className="text-gray-500 text-sm mt-2">Be the first to book a session and leave a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </p>
      </div>
      {reviews.map((review) => (
        <ReviewCard key={review.reviewID} review={review} />
      ))}
    </div>
  );
};

export default ReviewList;