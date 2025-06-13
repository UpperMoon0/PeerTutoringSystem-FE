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
  },

  // Admin method to get all bookings - this would need a backend endpoint like GET /api/Bookings/admin
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
      
      if (status && status !== 'All') {
        queryParams.append('status', status);
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

      // TODO: This endpoint doesn't exist yet in the backend
      // For now, we'll return mock data until the backend implements this
      // const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/Bookings/admin?${queryParams}`, {
      //   method: 'GET',
      // });
      
      // Mock implementation - replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const mockBookings: Booking[] = [
        {
          bookingId: '1',
          studentId: 'student-1',
          tutorId: 'tutor-1',
          sessionDate: '2024-01-15',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T11:00:00Z',
          status: 'Pending',
          createdAt: '2024-01-10T08:00:00Z',
          studentName: 'John Doe',
          tutorName: 'Jane Smith',
          topic: 'React Fundamentals',
          description: 'Learning React basics and components',
          skillId: 'skill-1'
        },
        {
          bookingId: '2',
          studentId: 'student-2',
          tutorId: 'tutor-2',
          sessionDate: '2024-01-16',
          startTime: '2024-01-16T14:00:00Z',
          endTime: '2024-01-16T15:00:00Z',
          status: 'Confirmed',
          createdAt: '2024-01-11T09:00:00Z',
          studentName: 'Alice Johnson',
          tutorName: 'Bob Wilson',
          topic: 'Python Programming',
          description: 'Advanced Python concepts and best practices',
          skillId: 'skill-2'
        },
        {
          bookingId: '3',
          studentId: 'student-3',
          tutorId: 'tutor-3',
          sessionDate: '2024-01-17',
          startTime: '2024-01-17T16:00:00Z',
          endTime: '2024-01-17T17:00:00Z',
          status: 'Completed',
          createdAt: '2024-01-12T10:00:00Z',
          studentName: 'Mike Johnson',
          tutorName: 'Sarah Davis',
          topic: 'JavaScript ES6',
          description: 'Modern JavaScript features and syntax',
          skillId: 'skill-3'
        },
        {
          bookingId: '4',
          studentId: 'student-4',
          tutorId: 'tutor-4',
          sessionDate: '2024-01-18',
          startTime: '2024-01-18T11:00:00Z',
          endTime: '2024-01-18T12:00:00Z',
          status: 'Cancelled',
          createdAt: '2024-01-13T11:00:00Z',
          studentName: 'Emma Wilson',
          tutorName: 'David Brown',
          topic: 'Node.js Backend',
          description: 'Building REST APIs with Node.js',
          skillId: 'skill-4'
        },
        {
          bookingId: '5',
          studentId: 'student-5',
          tutorId: 'tutor-5',
          sessionDate: '2024-01-19',
          startTime: '2024-01-19T13:00:00Z',
          endTime: '2024-01-19T14:00:00Z',
          status: 'Rejected',
          createdAt: '2024-01-14T12:00:00Z',
          studentName: 'Tom Anderson',
          tutorName: 'Lisa Garcia',
          topic: 'Database Design',
          description: 'SQL and database optimization',
          skillId: 'skill-5'
        }
      ];

      // Apply filters to mock data
      let filteredBookings = mockBookings;
      
      if (status && status !== 'All') {
        filteredBookings = filteredBookings.filter(booking => booking.status === status);
      }
      
      if (searchTerm && searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        filteredBookings = filteredBookings.filter(booking =>
          booking.studentName?.toLowerCase().includes(search) ||
          booking.tutorName?.toLowerCase().includes(search) ||
          booking.topic.toLowerCase().includes(search)
        );
      }

      if (startDate) {
        filteredBookings = filteredBookings.filter(booking =>
          new Date(booking.startTime) >= new Date(startDate)
        );
      }

      if (endDate) {
        filteredBookings = filteredBookings.filter(booking =>
          new Date(booking.startTime) <= new Date(endDate)
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);
      
      return {
        success: true,
        data: {
          bookings: paginatedBookings,
          totalCount: filteredBookings.length
        }
      };
    } catch (error: any) {
      console.error('Error fetching admin bookings:', error);
      return { success: false, error: error.message || "Failed to fetch admin bookings." };
    }
  }
};
