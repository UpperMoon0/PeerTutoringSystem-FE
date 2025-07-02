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
          className={`h-5 w-5 ${i <= rating ? 'text-primary fill-primary' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="mb-4 bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <Avatar className="border-2 border-gray-600">
          {/* Placeholder for student avatar - replace with actual data if available */}
          <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${review.studentID}`} alt="Student" />
          <AvatarFallback className="bg-gray-700 text-gray-300">ST</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {/* Placeholder for student name - replace with actual data if available */}
          <CardTitle className="text-lg text-white">Student {review.studentID.substring(0, 6)}...</CardTitle>
          <div className="flex items-center mt-1">
            {renderStars(review.rating)}
            <span className="ml-2 text-sm text-gray-400">({review.rating}/5)</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">
            {new Date(review.reviewDate).toLocaleDateString()}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {review.comment ? (
          <p className="text-gray-300 leading-relaxed">{review.comment}</p>
        ) : (
          <p className="text-gray-500 italic">No comment provided.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;