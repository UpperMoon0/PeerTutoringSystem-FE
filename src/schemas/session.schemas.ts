import { z } from 'zod';

export const createSessionSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  videoCallLink: z
    .string()
    .min(1, 'Video call link is required')
    .url('Please enter a valid URL'),
  sessionNotes: z
    .string()
    .min(10, 'Session notes must be at least 10 characters')
    .max(1000, 'Session notes must not exceed 1000 characters'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
}).refine((data) => {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  return endTime > startTime;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
});

export const createSessionWithConstraintsSchema = (
  bookingStartTime: string,
  bookingEndTime: string
) => createSessionSchema.refine((data) => {
  const sessionStart = new Date(data.startTime);
  const sessionEnd = new Date(data.endTime);
  const bookingStart = new Date(bookingStartTime);
  const bookingEnd = new Date(bookingEndTime);

  return sessionStart >= bookingStart && sessionEnd <= bookingEnd;
}, {
  message: `Session time must be within the booking time range (${new Date(bookingStartTime).toLocaleTimeString()} - ${new Date(bookingEndTime).toLocaleTimeString()})`,
  path: ['startTime', 'endTime']
});

export type CreateSessionFormData = z.infer<typeof createSessionSchema>;