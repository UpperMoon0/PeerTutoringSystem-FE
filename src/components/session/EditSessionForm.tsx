import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateSessionSchema, type UpdateSessionFormData } from '@/schemas/session.schemas';
import { SessionService } from '@/services/SessionService';
import { toast } from 'sonner';
import { Pencil, Loader2 } from 'lucide-react';
import type { Session } from '@/types/session.types';

interface EditSessionFormProps {
  session: Session;
  onSessionUpdated: (updatedSession: Session) => void;
  trigger?: React.ReactNode;
}

export const EditSessionForm: React.FC<EditSessionFormProps> = ({
  session,
  onSessionUpdated,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateSessionFormData>({
    resolver: zodResolver(updateSessionSchema),
    defaultValues: {
      videoCallLink: session.videoCallLink || '',
      sessionNotes: session.sessionNotes || '',
    },
  });

  const onSubmit = async (data: UpdateSessionFormData) => {
    setIsSubmitting(true);
    try {
      const result = await SessionService.updateSession(session.sessionId, data);
      
      if (result.success && result.data) {
        toast.success('Session updated successfully');
        onSessionUpdated(result.data);
        setIsOpen(false);
        form.reset();
      } else {
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || 'Failed to update session';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="border-gray-600 text-gray-300 hover:bg-gray-700"
    >
      <Pencil className="w-4 h-4 mr-2" />
      Edit Session
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Session Details</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="videoCallLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Video Call Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://meet.google.com/xxx-xxxx-xxx or https://zoom.us/j/..."
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessionNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Session Preparation Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What should the student prepare for this session? Any specific topics to focus on?"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[120px]"
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Session'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};