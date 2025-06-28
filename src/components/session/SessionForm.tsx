import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VideoIcon, FileText, Clock, AlertCircle } from 'lucide-react';
import type { Booking } from '@/types/booking.types';
import type { CreateSessionDto, UpdateSessionDto, Session } from '@/types/session.types';
import { createSessionWithConstraintsSchema, type SessionFormData } from '@/schemas/session.schemas';
import { format } from 'date-fns';
import { z } from 'zod';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface SessionFormProps {
  booking: Booking;
  session?: Session;
  onSubmit: (sessionData: CreateSessionDto | UpdateSessionDto) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

const SessionForm: React.FC<SessionFormProps> = ({
  booking,
  session,
  onSubmit,
  isSubmitting,
  error
}) => {
  // Always initialize startTime and endTime as local time with offset string
  const toLocalOffsetString = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const min = pad(date.getMinutes());
    const sec = pad(date.getSeconds());
    const offsetMin = -date.getTimezoneOffset();
    const offsetSign = offsetMin >= 0 ? '+' : '-';
    const offsetAbs = Math.abs(offsetMin);
    const offsetH = pad(Math.floor(offsetAbs / 60));
    const offsetM = pad(offsetAbs % 60);
    const offsetStr = `${offsetSign}${offsetH}:${offsetM}`;
    return `${year}-${month}-${day}T${hour}:${min}:${sec}${offsetStr}`;
  };

  const [formData, setFormData] = useState<SessionFormData>(() => {
    if (session) {
      return {
        bookingId: booking.bookingId,
        videoCallLink: session.videoCallLink,
        sessionNotes: session.sessionNotes,
        startTime: toLocalOffsetString(new Date(session.startTime)),
        endTime: toLocalOffsetString(new Date(session.endTime))
      };
    } else {
      return {
        bookingId: booking.bookingId,
        videoCallLink: '',
        sessionNotes: '',
        startTime: toLocalOffsetString(new Date(booking.startTime)),
        endTime: toLocalOffsetString(new Date(booking.endTime))
      };
    }
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

  // Helper function to format time input value
  const formatTimeLocal = (dateString: string): string => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Helper to convert 12-hour time to 24-hour "HH:mm"
  const to24Hour = (time12: string): string => {
    const match = time12.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) return '';
    const [, h, m, ap] = match;
    let hour = parseInt(h, 10);
    if (ap.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (ap.toUpperCase() === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${m}`;
  };

  // Shadcn-style TimePicker component
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
  const ampm = ['AM', 'PM'];

  const TimePicker: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: string;
  }> = ({ label, value, onChange, disabled, error }) => {
    const match = value.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i) || [];
    const [, h = '12', m = '00', ap = 'AM'] = match;
    const [open, setOpen] = React.useState(false);

    return (
      <div>
        <Label className="text-gray-300">{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between bg-gray-800 border-gray-700 text-white"
              disabled={disabled}
            >
              {value || 'Select time'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex gap-2 p-2 bg-gray-900 border-gray-700">
            <Select value={h} onValueChange={(val: string) => onChange(`${val}:${m} ${ap}`)} disabled={disabled}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.map(hr => (
                  <SelectItem key={hr} value={hr}>{hr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>:</span>
            <Select value={m} onValueChange={(val: string) => onChange(`${h}:${val} ${ap}`)} disabled={disabled}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {minutes.map(min => (
                  <SelectItem key={min} value={min}>{min}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ap} onValueChange={(val: string) => onChange(`${h}:${m} ${val}`)} disabled={disabled}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ampm.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </PopoverContent>
        </Popover>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    );
  };

  // Helper function to combine booking date with selected time and return local time string with offset (no UTC conversion)
  const combineDateWithTime = (date: Date, timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);

    const combinedDateTime = new Date(date); // Create Date object from date
    combinedDateTime.setHours(hours);
    combinedDateTime.setMinutes(minutes);
    combinedDateTime.setSeconds(0);
    combinedDateTime.setMilliseconds(0);

    // Modified line to preserve local time and include offset
    const localDatetimeString = toLocalOffsetString(combinedDateTime);
    return localDatetimeString;
  };

  const handleInputChange = (field: keyof SessionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const isoString = combineDateWithTime(new Date(booking.startTime), value);
    handleInputChange(field, isoString);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Log the exact values being sent to the API for verification
    console.log('[SessionForm] Submitting session with startTime:', formData.startTime, 'endTime:', formData.endTime);

    // Convert to CreateSessionDto format expected by the API
    if (session) {
      const sessionDto: UpdateSessionDto = {
        sessionId: session.sessionId,
        videoCallLink: formData.videoCallLink,
        sessionNotes: formData.sessionNotes,
        startTime: formData.startTime,
        endTime: formData.endTime
      };
      console.log('[SessionForm] Payload (UpdateSessionDto):', sessionDto);
      await onSubmit(sessionDto);
    } else {
      const sessionDto: CreateSessionDto = {
        bookingId: formData.bookingId,
        videoCallLink: formData.videoCallLink,
        sessionNotes: formData.sessionNotes,
        startTime: formData.startTime,
        endTime: formData.endTime
      };
      console.log('[SessionForm] Payload (CreateSessionDto):', sessionDto);
      await onSubmit(sessionDto);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <VideoIcon className="w-5 h-5 mr-2 text-blue-400" />
          Session Details
        </CardTitle>
        <div className="text-sm text-gray-400">
          <div className="flex items-center mt-2">
            <Clock className="w-4 h-4 mr-1 text-blue-400" />
            <span className="text-gray-400">
              {format(new Date(booking.startTime), 'PPP')} - {format(new Date(booking.startTime), 'p')} - {format(new Date(booking.endTime), 'p')}
            </span>
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
              Booking window: {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-gray-300">Session Start Time *</Label>
                <TimePicker
                  label="Session Start Time *"
                  value={formatTimeLocal(formData.startTime)}
                  onChange={val => handleTimeChange('startTime', to24Hour(val))}
                  disabled={isSubmitting}
                  error={formErrors.startTime}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-gray-300">Session End Time *</Label>
                <TimePicker
                  label="Session End Time *"
                  value={formatTimeLocal(formData.endTime)}
                  onChange={val => handleTimeChange('endTime', to24Hour(val))}
                  disabled={isSubmitting}
                  error={formErrors.endTime}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting
                ? session
                  ? 'Saving Changes...'
                  : 'Creating Session...'
                : session
                  ? 'Save Changes'
                  : 'Accept Booking & Create Session'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SessionForm;