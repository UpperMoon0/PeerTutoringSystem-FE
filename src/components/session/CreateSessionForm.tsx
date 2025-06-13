import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VideoIcon, FileText, Calendar, Clock, AlertCircle } from 'lucide-react';
import type { Booking } from '@/types/booking.types';
import type { CreateSessionDto } from '@/types/session.types';
import { createSessionWithConstraintsSchema, type CreateSessionFormData } from '@/schemas/session.schemas';
import { format } from 'date-fns';
import { z } from 'zod';

interface CreateSessionFormProps {
  booking: Booking;
  onSubmit: (sessionData: CreateSessionDto) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({
  booking,
  onSubmit,
  isSubmitting,
  error
}) => {
  const [formData, setFormData] = useState<CreateSessionFormData>({
    bookingId: booking.bookingId,
    videoCallLink: '',
    sessionNotes: '',
    startTime: booking.startTime,
    endTime: booking.endTime
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    try {
      const schema = createSessionWithConstraintsSchema(booking.startTime, booking.endTime);
      schema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const field = err.path[0] as string;
            errors[field] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  // Helper function to format datetime-local input value
  const formatDateTimeLocal = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // Helper function to convert datetime-local to ISO string
  const convertToISOString = (dateTimeLocal: string): string => {
    return new Date(dateTimeLocal).toISOString();
  };

  const handleInputChange = (field: keyof CreateSessionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const isoString = convertToISOString(value);
    handleInputChange(field, isoString);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert to CreateSessionDto format expected by the API
    const sessionDto: CreateSessionDto = {
      bookingId: formData.bookingId,
      videoCallLink: formData.videoCallLink,
      sessionNotes: formData.sessionNotes,
      startTime: formData.startTime,
      endTime: formData.endTime
    };

    await onSubmit(sessionDto);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <VideoIcon className="w-5 h-5 mr-2 text-blue-400" />
          Create Session Details
        </CardTitle>
        <div className="text-sm text-gray-400">
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-blue-400" />
              {format(new Date(booking.startTime), 'PPP')}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-blue-400" />
              {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
            </div>
          </div>
          <p className="mt-1">Student: {booking.studentName}</p>
          <p>Topic: {booking.topic}</p>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-900 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoCallLink" className="text-gray-300 flex items-center">
              <VideoIcon className="w-4 h-4 mr-1" />
              Video Call Link *
            </Label>
            <Input
              id="videoCallLink"
              type="url"
              placeholder="https://meet.google.com/... or https://zoom.us/..."
              value={formData.videoCallLink}
              onChange={(e) => handleInputChange('videoCallLink', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              disabled={isSubmitting}
            />
            {formErrors.videoCallLink && (
              <p className="text-red-400 text-sm">{formErrors.videoCallLink}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionNotes" className="text-gray-300 flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Session Notes *
            </Label>
            <Textarea
              id="sessionNotes"
              placeholder="Add any preparation notes, agenda, or materials the student should review before the session..."
              value={formData.sessionNotes}
              onChange={(e) => handleInputChange('sessionNotes', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[100px]"
              disabled={isSubmitting}
            />
            {formErrors.sessionNotes && (
              <p className="text-red-400 text-sm">{formErrors.sessionNotes}</p>
            )}
            <p className="text-gray-500 text-xs">
              Minimum 10 characters. Include session agenda, preparation materials, or any special instructions.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 className="text-gray-300 font-medium mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Session Time (within booking window)
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Booking window: {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')} on {format(new Date(booking.startTime), 'MMM dd, yyyy')}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-gray-300">Session Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formatDateTimeLocal(formData.startTime)}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  min={formatDateTimeLocal(booking.startTime)}
                  max={formatDateTimeLocal(booking.endTime)}
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isSubmitting}
                />
                {formErrors.startTime && (
                  <p className="text-red-400 text-sm">{formErrors.startTime}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-gray-300">Session End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formatDateTimeLocal(formData.endTime)}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  min={formatDateTimeLocal(booking.startTime)}
                  max={formatDateTimeLocal(booking.endTime)}
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isSubmitting}
                />
                {formErrors.endTime && (
                  <p className="text-red-400 text-sm">{formErrors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Creating Session...' : 'Accept Booking & Create Session'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateSessionForm;