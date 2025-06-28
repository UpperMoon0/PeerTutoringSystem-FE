export interface Session {
  sessionId: string;
  bookingId: string;
  videoCallLink: string;
  sessionNotes: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt?: string;
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
  videoCallLink: string;
  sessionNotes: string;
  startTime: string;
  endTime: string;
}

export interface SessionResponse {
  data: Session;
  message?: string;
  timestamp: string;
}

export interface SessionListResponse {
  data: Session[];
  totalCount: number;
  page: number;
  pageSize: number;
  timestamp: string;
}