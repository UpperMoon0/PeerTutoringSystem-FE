import React, { useState, useEffect, useCallback } from 'react';
import { TutorAvailabilityService } from '@/services/TutorAvailabilityService';
import type { TutorAvailability, CreateTutorAvailabilityDto } from '@/types/availability.types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { z } from 'zod';
import { createAvailabilitySchema, type CreateAvailabilityFormValues, getDayOfWeekString } from '@/schemas/availability.schemas';

const ManageAvailabilitySection: React.FC = () => {
  const { currentUser } = useAuth();
  const [availabilities, setAvailabilities] = useState<TutorAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<z.ZodError<CreateAvailabilityFormValues> | null>(null);

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined);

  // Helper to combine Date and time string into ISO string
  const combineDateAndTime = (date: Date | undefined, timeStr: string): string => {
    if (!date || !timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const combined = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
    return combined.toISOString();
  };

  const fetchAvailabilities = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'Tutor') return;
    setIsLoading(true);
    setError(null);
    const response = await TutorAvailabilityService.getTutorAvailability(currentUser.userId);
    if (response.success && response.data) {
      setAvailabilities(response.data.availabilities);
    } else {
      setError(response.error ? (response.error instanceof Error ? response.error.message : typeof response.error === 'string' ? response.error : String(response.error)) : 'Failed to fetch availabilities.');
    }
    setIsLoading(false);
  }, [currentUser, setAvailabilities, setError, setIsLoading]); // Add all dependencies

  useEffect(() => {
    if (currentUser && currentUser.role === 'Tutor') {
      fetchAvailabilities();
    }
  }, [currentUser, fetchAvailabilities]); // Add fetchAvailabilities to dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors(null);

    if (!currentUser) {
      setError("User not authenticated.");
      return;
    }

    const parseResult = createAvailabilitySchema.safeParse({
      selectedDate,
      startTimeStr,
      endTimeStr,
      isRecurring,
      recurrenceEndDate: isRecurring ? recurrenceEndDate : undefined,
    });

    if (!parseResult.success) {
      setValidationErrors(parseResult.error);
      setError("Please correct the form errors.");
      return;
    }

    const validatedData = parseResult.data;

    setIsLoading(true);

    const finalStartTime = combineDateAndTime(validatedData.selectedDate, validatedData.startTimeStr);
    const finalEndTime = combineDateAndTime(validatedData.selectedDate, validatedData.endTimeStr);
    const finalRecurrenceEndDate = validatedData.recurrenceEndDate ? validatedData.recurrenceEndDate.toISOString().split('T')[0] : undefined;
    
    const calculatedRecurringDay = validatedData.isRecurring && validatedData.selectedDate 
                                   ? getDayOfWeekString(validatedData.selectedDate) 
                                   : '';

    const newAvailability: CreateTutorAvailabilityDto = {
      startTime: finalStartTime,
      endTime: finalEndTime,
      isRecurring: validatedData.isRecurring || false,
      isDailyRecurring: false, 
      recurringDay: calculatedRecurringDay,
      recurrenceEndDate: validatedData.isRecurring ? finalRecurrenceEndDate : undefined,
    };

    const response = await TutorAvailabilityService.addAvailability(newAvailability);
    if (response.success) {
      setSelectedDate(undefined);
      setStartTimeStr('');
      setEndTimeStr('');
      setIsRecurring(false);
      setRecurrenceEndDate(undefined);
      setValidationErrors(null);
      fetchAvailabilities(); // Refresh the list
    } else {
      setError(response.error ? (response.error instanceof Error ? response.error.message : typeof response.error === 'string' ? response.error : String(response.error)) : 'Failed to add availability.');
    }
    setIsLoading(false);
  };
  
  const getErrorForField = (fieldName: keyof CreateAvailabilityFormValues) => {
    return validationErrors?.errors.find(err => err.path.includes(fieldName))?.message;
  };

  if (!currentUser || currentUser.role !== 'Tutor') {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Access Denied. Only tutors can manage availability.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">Manage Your Availability</h2>
        <p className="text-muted-foreground">Set your available time slots for tutoring sessions.</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Add New Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="selectedDate" className="text-muted-foreground">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-input border-border hover:bg-accent",
                        !selectedDate && "text-muted-foreground",
                        getErrorForField('selectedDate') && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-foreground" />
                      {selectedDate ? format(selectedDate, "PPP") : <span className="text-foreground">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (validationErrors) setValidationErrors(null);
                      }}
                      initialFocus
                      className="bg-popover"
                    />
                  </PopoverContent>
                </Popover>
                {getErrorForField('selectedDate') && <p className="text-destructive text-xs mt-1">{getErrorForField('selectedDate')}</p>}
              </div>
              <div>
                <Label htmlFor="startTimeInput" className="text-muted-foreground">Start Time</Label>
                <Input
                  type="time"
                  id="startTimeInput"
                  value={startTimeStr}
                  onChange={(e) => {
                    setStartTimeStr(e.target.value);
                    if (validationErrors) setValidationErrors(null);
                  }}
                  required
                  className={cn("w-full bg-input border-border text-foreground", getErrorForField('startTimeStr') && "border-destructive")}
                />
                {getErrorForField('startTimeStr') && <p className="text-destructive text-xs mt-1">{getErrorForField('startTimeStr')}</p>}
              </div>
              <div>
                <Label htmlFor="endTimeInput" className="text-muted-foreground">End Time</Label>
                <Input
                  type="time"
                  id="endTimeInput"
                  value={endTimeStr}
                  onChange={(e) => {
                    setEndTimeStr(e.target.value);
                    if (validationErrors) setValidationErrors(null);
                  }}
                  required
                  className={cn("w-full bg-input border-border text-foreground", getErrorForField('endTimeStr') && "border-destructive")}
                />
                {getErrorForField('endTimeStr') && <p className="text-destructive text-xs mt-1">{getErrorForField('endTimeStr')}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(Boolean(checked))}
                className="border-border"
              />
              <Label htmlFor="isRecurring" className="text-muted-foreground">Is Recurring?</Label>
            </div>

            {isRecurring && (
              <div className="space-y-4 p-4 border rounded-md bg-card-secondary border-border">
                <div>
                  <Label htmlFor="recurrenceEndDate" className="text-muted-foreground">Recurrence End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-input border-border hover:bg-accent",
                          !recurrenceEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50 text-foreground" />
                        {recurrenceEndDate ? format(recurrenceEndDate, "PPP") : <span className="text-foreground">Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover border-border">
                      <Calendar
                        mode="single"
                        selected={recurrenceEndDate}
                        onSelect={setRecurrenceEndDate}
                        initialFocus
                        className="bg-popover"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
            {error && <p className="text-destructive text-sm mt-2 text-center">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Adding...' : 'Add Availability'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Your Current Availabilities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground">Loading availabilities...</p>}
          {!isLoading && availabilities.length === 0 && <p className="text-muted-foreground">You have no availabilities set.</p>}
          {!isLoading && availabilities.length > 0 && (
            <div className="space-y-3">
              {availabilities.map(avail => (
                <div key={avail.availabilityId} className="p-4 bg-card-secondary border border-border rounded-lg">
                  <p className="text-foreground"><strong>From:</strong> {new Date(avail.startTime).toLocaleString()}</p>
                  <p className="text-foreground"><strong>To:</strong> {new Date(avail.endTime).toLocaleString()}</p>
                  {avail.isRecurring && (
                    <p className="text-muted-foreground">
                      Recurs on {avail.recurringDay}
                      {avail.recurrenceEndDate ? ` until ${new Date(avail.recurrenceEndDate).toLocaleDateString()}` : ' indefinitely'}
                    </p>
                  )}
                  <p className={avail.isBooked ? 'text-destructive' : 'text-primary'}>
                    {avail.isBooked ? 'Booked' : 'Available'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageAvailabilitySection;