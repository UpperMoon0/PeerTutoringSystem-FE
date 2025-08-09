import { AuthService } from "./AuthService";
import type { ApiResult } from "@/types/api.types"; 
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
const convertBookingFromBackend = (backendBooking: Record<string, unknown>): Booking => {
  return {
    bookingId: backendBooking.bookingId as string,
    studentId: backendBooking.studentId as string,
    tutorId: backendBooking.tutorId as string,
    availabilityId: backendBooking.availabilityId as string,
    sessionDate: backendBooking.sessionDate as string,
    startTime: backendBooking.startTime as string,
    endTime: backendBooking.endTime as string,
    status: backendBooking.status as "Pending" | "Confirmed" | "Cancelled" | "Completed" | "Rejected",
    paymentStatus: backendBooking.paymentStatus as "Unpaid" | "Paid",
    createdAt: backendBooking.createdAt as string,
    updatedAt: backendBooking.updatedAt as string,
    studentName: backendBooking.studentName as string,
    tutorName: backendBooking.tutorName as string,
    price: backendBooking.price as number,
    topic: backendBooking.topic as string,
    description: backendBooking.description as string,
    skillId: backendBooking.skillId as string,
    student: backendBooking.student as undefined,
    tutor: backendBooking.tutor as undefined,
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
        let errorPayload: Record<string, unknown>;
        try {
          errorPayload = await response.json();
        } catch {
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
    } catch (error: unknown) {
      // Catch network errors or other issues before fetchWithAuth completes
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch available slots due to a network or client-side error." };
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
    } catch (error: unknown) {
      console.error('Error creating booking:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to create booking." };
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
      const convertedBookings = responseData.data?.map((booking: Record<string, unknown>) => convertBookingFromBackend(booking)) || [];
      
      return {
        success: true,
        data: {
          bookings: convertedBookings,
          totalCount: responseData.totalCount || 0
        }
      };
    } catch (error: unknown) {
      console.error('Error fetching student bookings:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch student bookings." };
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
      
      // Always include status parameter - send null for "All" bookings, specific status otherwise
      if (params.status !== undefined && params.status !== null) {
        queryParams.append('status', params.status);
      } else {
        // When status is undefined or null (for "All" filter), send null instead of omitting the parameter
        queryParams.append('status', 'null');
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
      const convertedBookings = responseData.data?.map((booking: Record<string, unknown>) => convertBookingFromBackend(booking)) || [];
      
      return {
        success: true,
        data: {
          bookings: convertedBookings,
          totalCount: responseData.totalCount || 0,
          page: responseData.page || page,
          pageSize: responseData.pageSize || pageSize
        }
      };
    } catch (error: unknown) {
      console.error('Error fetching student booking history:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch student booking history." };
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
      const convertedBookings = responseData.data?.map((booking: Record<string, unknown>) => convertBookingFromBackend(booking)) || [];
      
      return {
        success: true,
        data: {
          bookings: convertedBookings,
          totalCount: responseData.totalCount || 0
        }
      };
    } catch (error: unknown) {
      console.error('Error fetching tutor bookings:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch tutor bookings." };
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
    } catch (error: unknown) {
      console.error('Error fetching booking details:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch booking details." };
    }
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResult<Booking>> {
    try {
      const payload = { status };
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload),
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
    } catch (error: unknown) {
      console.error('Error updating booking status:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update booking status." };
    }
  },

  // Admin method to get all bookings - using the correct admin endpoint
  async getAllBookingsForAdmin(
    page: number = 1,
    pageSize: number = 10,
    status?: string,
    startDate?: string,
    endDate?: string,
    searchTerm?: string
  ): Promise<ApiResult<{ bookings: Booking[], totalCount: number }>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      // Backend requires Status field - use "null" for all statuses, specific status otherwise
      if (status && status !== 'All') {
        queryParams.append('Status', status);
      } else {
        queryParams.append('Status', 'null');
      }
      
      if (startDate) {
        queryParams.append('startDate', formatDateForQuery(startDate));
      }
      
      if (endDate) {
        queryParams.append('endDate', formatDateForQuery(endDate));
      }
      
      if (searchTerm) {
        queryParams.append('searchTerm', searchTerm);
      }

      // Use the correct admin endpoint /Bookings/all which requires Admin role
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings/all?${queryParams}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch admin bookings: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Convert backend bookings to frontend format
      const convertedBookings = responseData.data?.map((booking: Record<string, unknown>) => convertBookingFromBackend(booking)) || [];
      
      return {
        success: true,
        data: {
          bookings: convertedBookings,
          totalCount: responseData.totalCount || 0
        }
      };
    } catch (error: unknown) {
      console.error('Error fetching admin bookings:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch admin bookings." };
    }
  },

  async getTutorDashboardStats(): Promise<ApiResult<{
    totalBookings: number;
    availableSlots: number;
    completedSessions: number;
    totalEarnings: number;
    pendingBookings: number;
    confirmedBookings: number;
  }>> {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings/tutor/dashboard-stats`, {
        method: 'GET',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to fetch tutor dashboard stats: ${response.statusText}`);
      }
      const responseData = await response.json();
      
      return { success: true, data: responseData.data };
    } catch (error: unknown) {
      console.error('Error fetching tutor dashboard stats:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch tutor dashboard stats." };
    }
  },

  async uploadProofOfPayment(bookingId: string, file: File): Promise<ApiResult<{ filePath: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/bookings/${bookingId}/upload-proof`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to upload proof of payment: ${response.statusText}`);
      }

      const responseData = await response.json();
      return { success: true, data: { filePath: responseData.filePath } };
    } catch (error: unknown) {
      console.error('Error uploading proof of payment:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to upload proof of payment." };
    }
  },

  async confirmPayment(bookingId: string, data: { status: string }): Promise<ApiResult<null>> {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/admin/bookings/${bookingId}/confirm-payment`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to confirm payment: ${response.statusText}`);
      }

      return { success: true, data: null };
    } catch (error: unknown) {
      console.error('Error confirming payment:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to confirm payment." };
    }
  }
};
