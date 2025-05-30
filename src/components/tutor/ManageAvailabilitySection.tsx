import React, { useState, useEffect } from 'react';
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

  const fetchAvailabilities = async () => {
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
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'Tutor') {
      fetchAvailabilities();
    }
  }, [currentUser]);

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
        <p className="text-gray-400">Access Denied. Only tutors can manage availability.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Manage Your Availability</h2>
        <p className="text-gray-400">Set your available time slots for tutoring sessions.</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Add New Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="selectedDate" className="text-gray-300">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-700",
                        !selectedDate && "text-muted-foreground",
                        getErrorForField('selectedDate') && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-white" />
                      {selectedDate ? format(selectedDate, "PPP") : <span className="text-white">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (validationErrors) setValidationErrors(null);
                      }}
                      initialFocus
                      className="bg-gray-800"
                    />
                  </PopoverContent>
                </Popover>
                {getErrorForField('selectedDate') && <p className="text-red-500 text-xs mt-1">{getErrorForField('selectedDate')}</p>}
              </div>
              <div>
                <Label htmlFor="startTimeInput" className="text-gray-300">Start Time</Label>
                <Input 
                  type="time" 
                  id="startTimeInput" 
                  value={startTimeStr} 
                  onChange={(e) => {
                    setStartTimeStr(e.target.value); 
                    if (validationErrors) setValidationErrors(null);
                  }}
                  required 
                  className={cn("w-full bg-gray-800 border-gray-700 text-white", getErrorForField('startTimeStr') && "border-red-500")}
                />
                {getErrorForField('startTimeStr') && <p className="text-red-500 text-xs mt-1">{getErrorForField('startTimeStr')}</p>}
              </div>
              <div>
                <Label htmlFor="endTimeInput" className="text-gray-300">End Time</Label>
                <Input 
                  type="time" 
                  id="endTimeInput" 
                  value={endTimeStr} 
                  onChange={(e) => {
                    setEndTimeStr(e.target.value); 
                    if (validationErrors) setValidationErrors(null);
                  }}
                  required 
                  className={cn("w-full bg-gray-800 border-gray-700 text-white", getErrorForField('endTimeStr') && "border-red-500")}
                />
                {getErrorForField('endTimeStr') && <p className="text-red-500 text-xs mt-1">{getErrorForField('endTimeStr')}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isRecurring" 
                checked={isRecurring} 
                onCheckedChange={(checked) => setIsRecurring(Boolean(checked))}
                className="border-gray-600"
              />
              <Label htmlFor="isRecurring" className="text-gray-300">Is Recurring?</Label>
            </div>

            {isRecurring && (
              <div className="space-y-4 p-4 border rounded-md bg-gray-800 border-gray-700">
                <div>
                  <Label htmlFor="recurrenceEndDate" className="text-gray-300">Recurrence End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-700",
                          !recurrenceEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50 text-white" />
                        {recurrenceEndDate ? format(recurrenceEndDate, "PPP") : <span className="text-white">Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                      <Calendar
                        mode="single"
                        selected={recurrenceEndDate}
                        onSelect={setRecurrenceEndDate}
                        initialFocus
                        className="bg-gray-800"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
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

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Your Current Availabilities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-gray-400">Loading availabilities...</p>}
          {!isLoading && availabilities.length === 0 && <p className="text-gray-400">You have no availabilities set.</p>}
          {!isLoading && availabilities.length > 0 && (
            <div className="space-y-3">
              {availabilities.map(avail => (
                <div key={avail.availabilityId} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <p className="text-white"><strong>From:</strong> {new Date(avail.startTime).toLocaleString()}</p>
                  <p className="text-white"><strong>To:</strong> {new Date(avail.endTime).toLocaleString()}</p>
                  {avail.isRecurring && (
                    <p className="text-gray-300">
                      Recurs on {avail.recurringDay}
                      {avail.recurrenceEndDate ? ` until ${new Date(avail.recurrenceEndDate).toLocaleDateString()}` : ' indefinitely'}
                    </p>
                  )}
                  <p className={avail.isBooked ? 'text-red-400' : 'text-green-400'}>
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