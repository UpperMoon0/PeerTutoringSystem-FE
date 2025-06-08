import { AuthService } from "./AuthService";
import type { ApiResult } from "@/types/api.types"; // Changed ApiResponse to ApiResult
import type { TutorAvailabilitiesPayload } from "@/types/tutorAvailability.types";
import type { Booking, CreateBookingDto, StudentBookingHistoryParams } from "@/types/booking.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatDateForQuery = (date: Date | string): string => {
  if (typeof date === 'string') {
    // If it's already a string, try to parse it as Date and format it properly
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
    return date;
  }
  return date.toISOString();
};

// Helper function to convert backend DTOs to frontend types
const convertBookingFromBackend = (backendBooking: any): Booking => {
  return {
    bookingId: backendBooking.bookingId,
    studentId: backendBooking.studentId,
    tutorId: backendBooking.tutorId,
    availabilityId: backendBooking.availabilityId,
    sessionDate: backendBooking.sessionDate,
    startTime: backendBooking.startTime,
    endTime: backendBooking.endTime,
    status: backendBooking.status,
    createdAt: backendBooking.createdAt,
    updatedAt: backendBooking.updatedAt,
    studentName: backendBooking.studentName,
    tutorName: backendBooking.tutorName,
    topic: backendBooking.topic,
    description: backendBooking.description,
    skillId: backendBooking.skillId,
    student: backendBooking.student,
    tutor: backendBooking.tutor
  };
};

export const BookingService = {
  async getTutorAvailableSlots(
    tutorId: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<ApiResult<TutorAvailabilitiesPayload>> {
    try {
      const queryParams = new URLSearchParams({
        tutorId,
        startDate: formatDateForQuery(startDate),
        endDate: formatDateForQuery(endDate),
        page: page.toString(),
        pageSize: pageSize.toString(),
        status: 'Available', 
      }).toString();
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/TutorAvailability/available?${queryParams}`, {
        method: 'GET',
      });

      if (!response.ok) {
        // Improved error handling
        let errorPayload: any;
        try {
          errorPayload = await response.json();
        } catch (e) {
          // If response.json() fails (e.g. not valid JSON, or empty for some errors)
          return { success: false, error: `API request failed with status ${response.status}. Unable to parse error response.` };
        }
        const errorMessage = errorPayload?.message || errorPayload?.error || `API request failed with status ${response.status}`;
        return { success: false, error: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage) };
      }

      const apiJsonResponse = await response.json(); // This is the full API JSON response

      // Construct the TutorAvailabilitiesPayload object as expected by the return type
      const constructedPayload: TutorAvailabilitiesPayload = {
        availabilities: apiJsonResponse.data, 
        totalCount: apiJsonResponse.totalCount,
        page: apiJsonResponse.page,
        pageSize: apiJsonResponse.pageSize,
      };
      return { success: true, data: constructedPayload };
    } catch (error: any) {
      // Catch network errors or other issues before fetchWithAuth completes
      return { success: false, error: error.message || "Failed to fetch available slots due to a network or client-side error." };
    }
  },

  async createBooking(bookingData: CreateBookingDto): Promise<ApiResult<Booking>> {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings`, {
        method: 'POST',
        body: JSON.stringify(bookingData),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to create booking: ${response.statusText}`);
      }
      const responseData = await response.json();
      
      // Convert backend booking to frontend format
      const convertedBooking = convertBookingFromBackend(responseData.data);
      
      return { success: true, data: convertedBooking };
    } catch (error: any) {
      console.error('Error creating booking:', error);
      return { success: false, error: error.message || "Failed to create booking." };
    }
  },

  async getStudentBookings(
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResult<{ bookings: Booking[], totalCount: number }>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      }).toString();
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings/student?${queryParams}`, {
        method: 'GET',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch student bookings: ${response.statusText}`);
      }
      const responseData = await response.json();
      
      // Convert backend bookings to frontend format
      const convertedBookings = responseData.data?.map((booking: any) => convertBookingFromBackend(booking)) || [];
      
      return {
        success: true,
        data: {
          bookings: convertedBookings,
          totalCount: responseData.totalCount || 0
        }
      };
    } catch (error: any) {
      console.error('Error fetching student bookings:', error);
      return { success: false, error: error.message || "Failed to fetch student bookings." };
    }
  },

  async getStudentBookingHistory(
    params: StudentBookingHistoryParams = {}
  ): Promise<ApiResult<{ bookings: Booking[], totalCount: number, page: number, pageSize: number }>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Set default pagination if not provided
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', pageSize.toString());
      
      if (params.status !== undefined) {
        // If params.status has a specific string value (e.g., 'Pending', 'Confirmed'),
        // it should be appended. For "All" statuses, params.status will be undefined,
        // and the status parameter will be omitted from the request.
        queryParams.append('status', params.status);
      }
      
      // Convert skillId to GUID format if provided
      if (params.skillId) {
        queryParams.append('skillId', params.skillId);
      }
      
      // Ensure proper date formatting for backend
      if (params.startDate) {
        queryParams.append('startDate', formatDateForQuery(params.startDate));
      }
      if (params.endDate) {
        queryParams.append('endDate', formatDateForQuery(params.endDate));
      }

      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings/student?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch student booking history: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Convert backend bookings to frontend format
      const convertedBookings = responseData.data?.map((booking: any) => convertBookingFromBackend(booking)) || [];
      
      return {
        success: true,
        data: {
          bookings: convertedBookings,
          totalCount: responseData.totalCount || 0,
          page: responseData.page || page,
          pageSize: responseData.pageSize || pageSize
        }
      };
    } catch (error: any) {
      console.error('Error fetching student booking history:', error);
      return { success: false, error: error.message || "Failed to fetch student booking history." };
    }
  },

  async getTutorBookings(
    status: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResult<{ bookings: Booking[], totalCount: number }>> {
    try {
      const queryParams = new URLSearchParams({
        Status: status,
        page: page.toString(),
        pageSize: pageSize.toString(),
      }).toString();
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings/tutor?${queryParams}`, {
        method: 'GET',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch tutor bookings: ${response.statusText}`);
      }
      const responseData = await response.json();
      
      // Convert backend bookings to frontend format
      const convertedBookings = responseData.data?.map((booking: any) => convertBookingFromBackend(booking)) || [];
      
      return {
        success: true,
        data: {
          bookings: convertedBookings,
          totalCount: responseData.totalCount || 0
        }
      };
    } catch (error: any) {
      console.error('Error fetching tutor bookings:', error);
      return { success: false, error: error.message || "Failed to fetch tutor bookings." };
    }
  },
  
  async getBookingById(bookingId: string): Promise<ApiResult<Booking>> {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings/${bookingId}`, { method: 'GET' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch booking details: ${response.statusText}`);
      }
      const responseData = await response.json();
      
      // Convert backend booking to frontend format
      const convertedBooking = convertBookingFromBackend(responseData.data);
      
      return { success: true, data: convertedBooking };
    } catch (error: any) {
      console.error('Error fetching booking details:', error);
      return { success: false, error: error.message || "Failed to fetch booking details." };
    }
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResult<Booking>> {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ Status: status }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to update booking status: ${response.statusText}`);
      }
      const responseData = await response.json();
      
      // Convert backend booking to frontend format
      const convertedBooking = convertBookingFromBackend(responseData.data);
      
      return { success: true, data: convertedBooking };
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      return { success: false, error: error.message || "Failed to update booking status." };
    }
  }
};
