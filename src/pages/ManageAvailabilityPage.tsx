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
import { createAvailabilitySchema, type CreateAvailabilityFormValues, getDayOfWeekString } from '@/schemas/availability.schemas'; // Import getDayOfWeekString

const ManageAvailabilityPage: React.FC = () => {
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
    return <div className="container mx-auto p-4">Access Denied. Only tutors can manage availability.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Your Availability</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="selectedDate">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                        getErrorForField('selectedDate') && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4 text-white" />
                      {selectedDate ? format(selectedDate, "PPP") : <span className="text-white">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (validationErrors) setValidationErrors(null); // Clear errors on change
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {getErrorForField('selectedDate') && <p className="text-red-500 text-xs mt-1">{getErrorForField('selectedDate')}</p>}
              </div>
              <div>
                <Label htmlFor="startTimeInput">Start Time</Label>
                <Input 
                  type="time" 
                  id="startTimeInput" 
                  value={startTimeStr} 
                  onChange={(e) => {
                    setStartTimeStr(e.target.value); 
                    if (validationErrors) setValidationErrors(null); // Clear errors on change
                  }}
                  required 
                  className={cn("w-full", getErrorForField('startTimeStr') && "border-red-500")}
                />
                {getErrorForField('startTimeStr') && <p className="text-red-500 text-xs mt-1">{getErrorForField('startTimeStr')}</p>}
              </div>
              <div>
                <Label htmlFor="endTimeInput">End Time</Label>
                <Input 
                  type="time" 
                  id="endTimeInput" 
                  value={endTimeStr} 
                  onChange={(e) => {
                    setEndTimeStr(e.target.value); 
                    if (validationErrors) setValidationErrors(null); // Clear errors on change
                  }}
                  required 
                  className={cn("w-full", getErrorForField('endTimeStr') && "border-red-500")}
                />
                {getErrorForField('endTimeStr') && <p className="text-red-500 text-xs mt-1">{getErrorForField('endTimeStr')}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="isRecurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(Boolean(checked))} />
              <Label htmlFor="isRecurring">Is Recurring?</Label>
            </div>

            {isRecurring && (
              <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                <div>
                  <Label htmlFor="recurrenceEndDate">Recurrence End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !recurrenceEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50 text-white" />
                        {recurrenceEndDate ? format(recurrenceEndDate, "PPP") : <span className="text-white">Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={recurrenceEndDate}
                        onSelect={setRecurrenceEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full mt-6">{isLoading ? 'Adding...' : 'Add Availability'}</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Your Current Availabilities</h2>
      {isLoading && <p>Loading availabilities...</p>}
      {!isLoading && availabilities.length === 0 && <p>You have no availabilities set.</p>}
      {!isLoading && availabilities.length > 0 && (
        <ul className="space-y-2">
          {availabilities.map(avail => (
            <li key={avail.availabilityId} className="p-4 border rounded shadow-sm">
              <p><strong>From:</strong> {new Date(avail.startTime).toLocaleString()}</p>
              <p><strong>To:</strong> {new Date(avail.endTime).toLocaleString()}</p>
              {avail.isRecurring && (
                <p>Recurs on {avail.recurringDay}{avail.recurrenceEndDate ? ` until ${new Date(avail.recurrenceEndDate).toLocaleDateString()}` : ' indefinitely'}</p>
              )}
              <p className={avail.isBooked ? 'text-red-500' : 'text-green-500'}>{avail.isBooked ? 'Booked' : 'Available'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageAvailabilityPage;
