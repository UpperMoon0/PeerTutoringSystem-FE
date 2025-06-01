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
    return <p>Loading reviews...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return <p>No reviews yet for this tutor.</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard key={review.reviewID} review={review} />
      ))}
    </div>
  );
};

export default ReviewList;