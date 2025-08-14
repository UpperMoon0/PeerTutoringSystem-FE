import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ReviewDto } from '@/types/review.types';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  review: ReviewDto;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="mb-4 bg-card border-border">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <Avatar className="border-2 border-accent">
          {/* Placeholder for student avatar - replace with actual data if available */}
          <AvatarImage src={review.studentAvatarUrl} alt={review.studentName} />
          <AvatarFallback className="bg-accent text-muted-foreground">
            {review.studentName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg text-foreground">{review.studentName}</CardTitle>
          <div className="flex items-center mt-1">
            {renderStars(review.rating)}
            <span className="ml-2 text-sm text-muted-foreground">({review.rating}/5)</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {new Date(review.reviewDate).toLocaleDateString()}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {review.comment ? (
          <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
        ) : (
          <p className="text-muted-foreground italic">No comment provided.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;