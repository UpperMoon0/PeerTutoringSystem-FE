export interface Session {
  sessionId: string;
  bookingId: string;
  videoCallLink: string;
  sessionNotes: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionDto {
  bookingId: string;
  videoCallLink: string;
  sessionNotes: string;
  startTime: string;
  endTime: string;
}

export interface UpdateSessionDto {
  sessionId: string;
  videoCallLink?: string;
  sessionNotes?: string;
  startTime?: string;
  endTime?: string;
}

export interface TutorSessionStats {
  totalSessions: number;
  completedSessions: number;
  canceledSessions: number;
  totalHours: number;
}