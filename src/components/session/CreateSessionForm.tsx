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
import { format } from 'date-fns';

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
  const [formData, setFormData] = useState<CreateSessionDto>({
    bookingId: booking.bookingId,
    videoCallLink: '',
    sessionNotes: '',
    startTime: booking.startTime,
    endTime: booking.endTime
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.videoCallLink.trim()) {
      errors.videoCallLink = 'Video call link is required';
    } else if (!isValidUrl(formData.videoCallLink)) {
      errors.videoCallLink = 'Please enter a valid URL';
    }

    if (!formData.sessionNotes.trim()) {
      errors.sessionNotes = 'Session notes are required';
    } else if (formData.sessionNotes.trim().length < 10) {
      errors.sessionNotes = 'Session notes must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field: keyof CreateSessionDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-gray-300">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime.slice(0, 16)}
                onChange={(e) => handleInputChange('startTime', e.target.value + ':00.000Z')}
                className="bg-gray-800 border-gray-700 text-white"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-gray-300">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime.slice(0, 16)}
                onChange={(e) => handleInputChange('endTime', e.target.value + ':00.000Z')}
                className="bg-gray-800 border-gray-700 text-white"
                disabled={isSubmitting}
              />
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