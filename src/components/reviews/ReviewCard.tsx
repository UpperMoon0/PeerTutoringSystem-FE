import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ReviewDto } from '@/types/review.types';
import { Star } from 'lucide-react'; // Assuming lucide-react for icons

interface ReviewCardProps {
  review: ReviewDto;
  // TODO: Potentially add student name/avatar if available from a joined query or separate fetch
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <Avatar>
          {/* Placeholder for student avatar - replace with actual data if available */}
          <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${review.studentID}`} alt="Student" />
          <AvatarFallback>ST</AvatarFallback>
        </Avatar>
        <div>
          {/* Placeholder for student name - replace with actual data if available */}
          <CardTitle className="text-lg">Student {review.studentID.substring(0, 6)}...</CardTitle>
          <div className="flex items-center">
            {renderStars(review.rating)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          Reviewed on: {new Date(review.reviewDate).toLocaleDateString()}
        </p>
        <p className="text-gray-700 dark:text-gray-200">{review.comment || 'No comment provided.'}</p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;