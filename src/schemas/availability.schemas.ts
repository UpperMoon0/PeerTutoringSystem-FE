import { z } from 'zod';

export const timeStringSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)");

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const createAvailabilitySchema = z.object({
  selectedDate: z.date({
    required_error: "Date is required.",
    invalid_type_error: "Invalid date format.",
  }),
  startTimeStr: timeStringSchema,
  endTimeStr: timeStringSchema,
  isRecurring: z.boolean().optional(),
  // recurringDay is removed as it will be derived
  recurrenceEndDate: z.date().optional(),
}).refine(data => {
  if (data.selectedDate && data.startTimeStr && data.endTimeStr) {
    const [startHours, startMinutes] = data.startTimeStr.split(':').map(Number);
    const [endHours, endMinutes] = data.endTimeStr.split(':').map(Number);
    
    const startDate = new Date(data.selectedDate);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(data.selectedDate);
    endDate.setHours(endHours, endMinutes, 0, 0);

    return endDate > startDate;
  }
  return true;
}, {
  message: "End time must be after start time on the same day.",
  path: ["endTimeStr"], 
});

export type CreateAvailabilityFormValues = z.infer<typeof createAvailabilitySchema>;

// Helper function to get day of the week string from a Date object
export const getDayOfWeekString = (date: Date): typeof daysOfWeek[number] => {
  return daysOfWeek[date.getDay()];
};
