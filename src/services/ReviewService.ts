import { apiClient } from './AuthService';
import type { ServiceResult, ApiResult } from '@/types/api.types';
import type { CreateReviewDto, ReviewDto } from '@/types/review.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Creates a new review.
 * @param payload - The data for creating the review.
 * @returns A promise that resolves with the created review data.
 */
const createReview = async (payload: CreateReviewDto): Promise<ServiceResult<ReviewDto>> => {
  try {
    // Wrap payload in "dto" object as expected by backend
    const requestBody = { dto: payload };
    const response = await apiClient.post(`/Reviews`, requestBody);
    return { success: true, data: response.data as ReviewDto };
  } catch (error: any) {
    console.error('Error creating review:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Failed to create review.';
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetches a specific review by its ID.
 * @param reviewId - The ID of the review to fetch.
 * @returns A promise that resolves with the review data.
 */
const getReviewById = async (reviewId: number): Promise<ServiceResult<ReviewDto>> => {
  try {
    const response = await apiClient.get(`/Reviews/${reviewId}`);
    return { success: true, data: response.data as ReviewDto };
  } catch (error: any) {
    console.error(`Error fetching review with ID ${reviewId}:`, error);
    const errorMessage = error.response?.data?.error || error.message || `Failed to fetch review ${reviewId}.`;
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetches all reviews for a specific tutor.
 * @param tutorId - The ID of the tutor.
 * @returns A promise that resolves with an array of review data.
 */
const getReviewsByTutorId = async (tutorId: string): Promise<ServiceResult<ReviewDto[]>> => {
  try {
    const response = await apiClient.get(`/Reviews/tutor/${tutorId}`);
    return { success: true, data: response.data as ReviewDto[] };
  } catch (error: any) {
    console.error(`Error fetching reviews for tutor ID ${tutorId}:`, error);
    const errorMessage = error.response?.data?.error || error.message || `Failed to fetch reviews for tutor ${tutorId}.`;
    return { success: false, error: errorMessage };
  }
};

/**
 * Checks if a review exists for a specific booking.
 * @param bookingId - The ID of the booking to check.
 * @returns A promise that resolves with boolean indicating if review exists.
 */
const checkReviewExistsForBooking = async (bookingId: string): Promise<ServiceResult<boolean>> => {
  try {
    const response = await apiClient.get(`/Reviews/booking/${bookingId}/exists`);
    return { success: true, data: response.data as boolean };
  } catch (error: any) {
    console.error(`Error checking review for booking ID ${bookingId}:`, error);
    // If the endpoint doesn't exist or returns 404, assume no review exists
    if (error.response?.status === 404) {
      return { success: true, data: false };
    }
    const errorMessage = error.response?.data?.error || error.message || `Failed to check review for booking ${bookingId}.`;
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetches a review for a specific booking.
 * @param bookingId - The ID of the booking.
 * @returns A promise that resolves with the review data if it exists.
 */
const getReviewByBookingId = async (bookingId: string): Promise<ServiceResult<ReviewDto | null>> => {
  try {
    const response = await apiClient.get(`/Reviews/booking/${bookingId}`);
    return { success: true, data: response.data as ReviewDto };
  } catch (error: any) {
    console.error(`Error fetching review for booking ID ${bookingId}:`, error);
    // If 404, it means no review exists for this booking
    if (error.response?.status === 404) {
      return { success: true, data: null };
    }
    const errorMessage = error.response?.data?.error || error.message || `Failed to fetch review for booking ${bookingId}.`;
    return { success: false, error: errorMessage };
  }
};

export const ReviewService = {
  createReview,
  getReviewById,
  getReviewsByTutorId,
  checkReviewExistsForBooking,
  getReviewByBookingId,
};