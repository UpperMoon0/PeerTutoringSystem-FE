import React, { useState, useEffect } from 'react';
import { TutorAvailabilityService } from '@/services/TutorAvailabilityService';
import type { TutorAvailability, CreateTutorAvailability } from '@/types/tutorAvailability.types';
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

const ManageAvailabilityPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [availabilities, setAvailabilities] = useState<TutorAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state using Date objects for calendar and string for time
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTimeStr, setStartTimeStr] = useState(''); // HH:mm
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTimeStr, setEndTimeStr] = useState(''); // HH:mm
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState('Monday');
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
      setError(response.error instanceof Error ? response.error.message : response.error || 'Failed to fetch availabilities.');
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
    if (!currentUser || !startDate || !startTimeStr || !endDate || !endTimeStr) {
      setError("Please select start and end dates and times.");
      return;
    }
    setError(null);
    setIsLoading(true);

    const finalStartTime = combineDateAndTime(startDate, startTimeStr);
    const finalEndTime = combineDateAndTime(endDate, endTimeStr);
    const finalRecurrenceEndDate = recurrenceEndDate ? recurrenceEndDate.toISOString().split('T')[0] : null; // Just the date part

    if (new Date(finalEndTime) <= new Date(finalStartTime)) {
      setError("End time must be after start time.");
      setIsLoading(false);
      return;
    }

    const newAvailability: CreateTutorAvailability = {
      startTime: finalStartTime,
      endTime: finalEndTime,
      isRecurring,
      recurringDay: isRecurring ? recurringDay : '',
      recurrenceEndDate: isRecurring ? finalRecurrenceEndDate : null,
    };

    const response = await TutorAvailabilityService.addAvailability(newAvailability);
    if (response.success) {
      setStartDate(undefined);
      setStartTimeStr('');
      setEndDate(undefined);
      setEndTimeStr('');
      setIsRecurring(false);
      setRecurringDay('Monday');
      setRecurrenceEndDate(undefined);
      fetchAvailabilities(); // Refresh the list
    } else {
      setError(response.error instanceof Error ? response.error.message : response.error || 'Failed to add availability.');
    }
    setIsLoading(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input type="time" id="startTime" value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)} required className="w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input type="time" id="endTime" value={endTimeStr} onChange={(e) => setEndTimeStr(e.target.value)} required className="w-full"/>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="isRecurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(Boolean(checked))} />
              <Label htmlFor="isRecurring">Is Recurring?</Label>
            </div>

            {isRecurring && (
              <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                <div>
                  <Label htmlFor="recurringDay">Recurring Day</Label>
                  <select id="recurringDay" value={recurringDay} onChange={(e) => setRecurringDay(e.target.value)} className="w-full p-2 border rounded bg-background text-foreground focus:ring-ring focus:border-ring">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
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
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {recurrenceEndDate ? format(recurrenceEndDate, "PPP") : <span>Pick a date</span>}
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
