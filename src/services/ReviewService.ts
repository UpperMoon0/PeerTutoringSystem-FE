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
    const response = await apiClient.post(`/Reviews`, payload);
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

export const ReviewService = {
  createReview,
  getReviewById,
  getReviewsByTutorId,
};