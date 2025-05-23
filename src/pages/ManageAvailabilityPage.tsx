import React, { useState, useEffect } from 'react';
import { TutorAvailabilityService } from '@/services/TutorAvailabilityService';
import type { TutorAvailability, CreateTutorAvailability } from '@/types/tutorAvailability.types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ManageAvailabilityPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [availabilities, setAvailabilities] = useState<TutorAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState('Monday');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string | null>(null);

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
    if (!currentUser) return;
    setError(null);
    setIsLoading(true);

    const newAvailability: CreateTutorAvailability = {
      startTime,
      endTime,
      isRecurring,
      recurringDay: isRecurring ? recurringDay : '',
      recurrenceEndDate: isRecurring ? recurrenceEndDate : null,
    };

    const response = await TutorAvailabilityService.addAvailability(newAvailability);
    if (response.success) {
      setStartTime('');
      setEndTime('');
      setIsRecurring(false);
      setRecurringDay('Monday');
      setRecurrenceEndDate(null);
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input type="datetime-local" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input type="datetime-local" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isRecurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(Boolean(checked))} />
              <Label htmlFor="isRecurring">Is Recurring?</Label>
            </div>
            {isRecurring && (
              <>
                <div>
                  <Label htmlFor="recurringDay">Recurring Day</Label>
                  <select id="recurringDay" value={recurringDay} onChange={(e) => setRecurringDay(e.target.value)} className="w-full p-2 border rounded">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="recurrenceEndDate">Recurrence End Date (Optional)</Label>
                  <Input type="date" id="recurrenceEndDate" value={recurrenceEndDate || ''} onChange={(e) => setRecurrenceEndDate(e.target.value || null)} />
                </div>
              </>
            )}
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Availability'}</Button>
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
