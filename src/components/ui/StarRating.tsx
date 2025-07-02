import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
  reviewCount,
  className
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const fillPercentage = Math.max(0, Math.min(1, rating - i + 1));
      
      stars.push(
        <div key={i} className="relative inline-block">
          {/* Background star (empty) */}
          <Star 
            className={cn(
              sizeClasses[size],
              "text-gray-400 stroke-gray-400"
            )}
          />
          
          {/* Foreground star (filled) */}
          {fillPercentage > 0 && (
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fillPercentage * 100}%` }}
            >
              <Star 
                className={cn(
                  sizeClasses[size],
                  "text-primary fill-primary stroke-primary"
                )}
              />
            </div>
          )}
        </div>
      );
    }
    return stars;
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {renderStars()}
      </div>
      
      {showNumber && (
        <div className={cn("flex items-center gap-1", textSizeClasses[size])}>
          <span className="font-medium text-white">
            {rating > 0 ? rating.toFixed(1) : 'No rating'}
          </span>
          {reviewCount !== undefined && (
            <span className="text-gray-400">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;