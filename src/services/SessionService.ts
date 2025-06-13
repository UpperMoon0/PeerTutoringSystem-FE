import { AuthService } from "./AuthService";
import type { ApiResult } from "@/types/api.types";
import type { Session, CreateSessionDto, UpdateSessionDto } from "@/types/session.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to convert backend DTOs to frontend types
const convertSessionFromBackend = (backendSession: any): Session => {
  return {
    sessionId: backendSession.sessionId,
    bookingId: backendSession.bookingId,
    videoCallLink: backendSession.videoCallLink,
    sessionNotes: backendSession.sessionNotes,
    startTime: backendSession.startTime,
    endTime: backendSession.endTime,
    createdAt: backendSession.createdAt,
    updatedAt: backendSession.updatedAt
  };
};

export const SessionService = {
  async createSession(sessionData: CreateSessionDto): Promise<ApiResult<Session>> {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Sessions`, {
        method: 'POST',
        body: JSON.stringify(sessionData),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to create session: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Convert backend session to frontend format
      const convertedSession = convertSessionFromBackend(responseData.data);
      
      return { success: true, data: convertedSession };
    } catch (error: any) {
      console.error('Error creating session:', error);
      return { success: false, error: error.message || "Failed to create session." };
    }
  },

  async getSessionById(sessionId: string): Promise<ApiResult<Session>> {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Sessions/${sessionId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch session: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Convert backend session to frontend format
      const convertedSession = convertSessionFromBackend(responseData.data);
      
      return { success: true, data: convertedSession };
    } catch (error: any) {
      console.error('Error fetching session:', error);
      return { success: false, error: error.message || "Failed to fetch session." };
    }
  },

  async getSessionByBookingId(bookingId: string): Promise<ApiResult<Session>> {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Sessions/booking/${bookingId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch session by booking ID: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Convert backend session to frontend format
      const convertedSession = convertSessionFromBackend(responseData.data);
      
      return { success: true, data: convertedSession };
    } catch (error: any) {
      console.error('Error fetching session by booking ID:', error);
      return { success: false, error: error.message || "Failed to fetch session by booking ID." };
    }
  },

  async getUserSessions(
    page: number = 1,
    pageSize: number = 10,
    status?: string,
    skillId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResult<{ sessions: Session[], totalCount: number, page: number, pageSize: number }>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (status) queryParams.append('status', status);
      if (skillId) queryParams.append('skillId', skillId);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Sessions/user?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch user sessions: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Convert backend sessions to frontend format
      const convertedSessions = responseData.data?.map((session: any) => convertSessionFromBackend(session)) || [];
      
      return {
        success: true,
        data: {
          sessions: convertedSessions,
          totalCount: responseData.totalCount || 0,
          page: responseData.page || page,
          pageSize: responseData.pageSize || pageSize
        }
      };
    } catch (error: any) {
      console.error('Error fetching user sessions:', error);
      return { success: false, error: error.message || "Failed to fetch user sessions." };
    }
  },

  async updateSession(sessionId: string, sessionData: UpdateSessionDto): Promise<ApiResult<Session>> {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to update session: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Convert backend session to frontend format
      const convertedSession = convertSessionFromBackend(responseData.data);
      
      return { success: true, data: convertedSession };
    } catch (error: any) {
      console.error('Error updating session:', error);
      return { success: false, error: error.message || "Failed to update session." };
    }
  }
};