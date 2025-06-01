import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // For rating, or use a star component
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ReviewService } from '@/services/ReviewService';
import type { CreateReviewDto } from '@/types/review.types';
import { useAuth } from '@/contexts/AuthContext'; // To get studentID
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Star } from 'lucide-react';

const reviewFormSchema = z.object({
  rating: z.coerce.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
  // bookingID will be passed as a prop or handled differently
});

interface SubmitReviewFormProps {
  tutorId: string;
  bookingId: string; // Assuming bookingId is available where this form is used
  onReviewSubmitted?: () => void; // Optional callback after successful submission
}

const SubmitReviewForm: React.FC<SubmitReviewFormProps> = ({ tutorId, bookingId, onReviewSubmitted }) => {
  const { currentUser } = useAuth(); // Changed 'user' to 'currentUser'
  const [submissionStatus, setSubmissionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentRating, setCurrentRating] = useState(0);

  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof reviewFormSchema>) => {
    if (!currentUser?.userId) { // Changed 'user' to 'currentUser'
      setSubmissionStatus({ type: 'error', message: 'You must be logged in to submit a review.' });
      return;
    }
    if (currentRating === 0) {
        form.setError("rating", { type: "manual", message: "Please select a rating." });
        return;
    }

    const payload: CreateReviewDto = {
      bookingID: bookingId,
      studentID: currentUser.userId, // Changed 'user' to 'currentUser'
      tutorID: tutorId,
      rating: currentRating, // Use currentRating from state
      comment: values.comment,
    };

    setSubmissionStatus(null);
    const result = await ReviewService.createReview(payload);

    if (result.success) {
      setSubmissionStatus({ type: 'success', message: 'Review submitted successfully!' });
      form.reset({ rating: 0, comment: '' });
      setCurrentRating(0);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : (result.error as Error)?.message || 'Failed to submit review.';
      setSubmissionStatus({ type: 'error', message: errorMessage });
    }
  };

  const handleStarClick = (ratingValue: number) => {
    setCurrentRating(ratingValue);
    form.setValue('rating', ratingValue, { shouldValidate: true });
     if (form.formState.errors.rating) {
        form.clearErrors("rating");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormItem>
          <FormLabel>Rating</FormLabel>
          <FormControl>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer ${
                    star <= currentRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                  }`}
                  onClick={() => handleStarClick(star)}
                />
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Share your experience..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submissionStatus && (
          <Alert variant={submissionStatus.type === 'error' ? 'destructive' : 'default'}>
            <Terminal className="h-4 w-4" />
            <AlertTitle>{submissionStatus.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{submissionStatus.message}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Form>
  );
};

export default SubmitReviewForm;