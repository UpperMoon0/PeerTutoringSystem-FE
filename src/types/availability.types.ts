export interface TutorAvailability {
  availabilityId: string;
  tutorId: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  isDailyRecurring: boolean;
  recurringDay: string;
  recurrenceEndDate?: string;
  isBooked: boolean;
}

export interface CreateTutorAvailabilityDto {
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  isDailyRecurring: boolean;
  recurringDay: string;
  recurrenceEndDate?: string;
}
