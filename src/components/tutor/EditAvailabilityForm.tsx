import React, { useState } from 'react';
import type { TutorAvailability } from '@/types/availability.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { z } from 'zod';
import { updateAvailabilitySchema, type UpdateAvailabilityFormValues, getDayOfWeekString } from '@/schemas/availability.schemas';
import { TutorAvailabilityService } from '@/services/TutorAvailabilityService';

interface EditAvailabilityFormProps {
  availability: TutorAvailability;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditAvailabilityForm: React.FC<EditAvailabilityFormProps> = ({ availability, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(availability.startTime));
  const [startTimeStr, setStartTimeStr] = useState(format(new Date(availability.startTime), 'HH:mm'));
  const [endTimeStr, setEndTimeStr] = useState(format(new Date(availability.endTime), 'HH:mm'));
  const [isRecurring, setIsRecurring] = useState(availability.isRecurring);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(availability.recurrenceEndDate ? new Date(availability.recurrenceEndDate) : undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<z.ZodError<UpdateAvailabilityFormValues> | null>(null);

  const combineDateAndTime = (date: Date | undefined, timeStr: string): string => {
    if (!date || !timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const combined = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
    return combined.toISOString();
  };

  const getErrorForField = (fieldName: keyof UpdateAvailabilityFormValues) => {
    return validationErrors?.errors.find(err => err.path.includes(fieldName))?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors(null);

    const parseResult = updateAvailabilitySchema.safeParse({
      availabilityId: availability.availabilityId,
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

    const updatedAvailability = {
      startTime: finalStartTime,
      endTime: finalEndTime,
      isRecurring: validatedData.isRecurring || false,
      isDailyRecurring: false, 
      recurringDay: calculatedRecurringDay,
      recurrenceEndDate: validatedData.isRecurring ? finalRecurrenceEndDate : undefined,
    };

    const response = await TutorAvailabilityService.updateAvailability(availability.availabilityId, updatedAvailability);
    if (response.success) {
      onSuccess();
      onClose();
    } else {
      setError(response.error ? (response.error instanceof Error ? response.error.message : typeof response.error === 'string' ? response.error : String(response.error)) : 'Failed to update availability.');
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Edit Availability</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-ring hover:from-primary/90 hover:to-ring/90"
          >
            {isLoading ? 'Updating...' : 'Update Availability'}
          </Button>
        </div>
      </form>
    </div>
  );
};