import { z } from 'zod';

export const createSessionSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  videoCallLink: z
    .string()
    .min(1, 'Video call link is required')
    .url('Please enter a valid URL'),
  sessionNotes: z
    .string()
    .max(1000, 'Session notes must not exceed 1000 characters')
    .optional(),
  // Accepts local datetime with offset, e.g. 2025-06-28T20:00:00+07:00
  startTime: z.string().refine(
    val => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2})$/.test(val),
    { message: 'Invalid start time format' }
  ),
  endTime: z.string().refine(
    val => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2})$/.test(val),
    { message: 'Invalid end time format' }
  ),
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

export const updateSessionSchema = z.object({
  videoCallLink: z
    .string()
    .min(1, 'Video call link is required')
    .url('Please enter a valid URL'),
  sessionNotes: z
    .string()
    .max(1000, 'Session notes must not exceed 1000 characters')
    .optional(),
});

export type SessionFormData = z.infer<typeof createSessionSchema>;
export type UpdateSessionFormData = z.infer<typeof updateSessionSchema>;