import { AuthService } from "./AuthService";
import type { ApiResult } from "@/types/api.types";
import type {
  ProcessPaymentDto,
  ProcessPaymentResponse,
  AdminFinanceDetails,
  TransactionHistory,
  Payment,
} from '@/types/payment.types';
import type { PayOSCreatePaymentLinkRequest, PayOSCreatePaymentLinkResponse } from '@/types/payos.types';
import { apiClient } from './AuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const PaymentService = {
  processPayment: async (data: ProcessPaymentDto): Promise<ApiResult<ProcessPaymentResponse>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/payment/process`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to process payment: ${response.statusText}`);
      }
      const responseData = await response.json();
      return { success: true, data: responseData.data };
    } catch (error: unknown) {
      console.error('Error processing payment:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to process payment." };
    }
  },

  getAdminFinanceDetails: async (): Promise<ApiResult<AdminFinanceDetails>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/payment/admin/finance-details`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        throw new Error(errorData.error || `Failed to fetch admin finance details: ${response.statusText}`);
      }
      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error: unknown) {
      console.error('Error fetching admin finance details:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch admin finance details.' };
    }
  },

  getAllPayments: async (): Promise<ApiResult<Payment[]>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/payment/admin/all-payments`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        throw new Error(errorData.error || `Failed to fetch payments: ${response.statusText}`);
      }
      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error: unknown) {
      console.error('Error fetching payments:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch payments.' };
    }
  },

  createPaymentLink: async (data: PayOSCreatePaymentLinkRequest): Promise<ApiResult<PayOSCreatePaymentLinkResponse>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/payment/create-payment-link`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to create payment link: ${response.statusText}`);
      }
      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error: unknown) {
      console.error('Error creating payment link:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to create payment link." };
    }
  },

  confirmPayment: async (bookingId: string): Promise<ApiResult<any>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/payment/confirm?bookingId=${bookingId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(errorData.error || `Failed to confirm payment: ${response.statusText}`);
      }
      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error: unknown) {
      console.error('Error confirming payment:', error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to confirm payment." };
    }
  },

  getTransactionHistory: async (): Promise<ApiResult<TransactionHistory[]>> => {
    try {
      const response = await apiClient.get('/payment/history');
      return { success: true, data: response.data };
    } catch (error: unknown) {
      console.error('Error fetching transaction history:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch transaction history.' };
    }
  },

  createPayment: async (bookingId: string) => {
    const response = await apiClient.post('/payment/create', { bookingId });
    return response.data;
  },

  getPaymentStatus: async (paymentId: string) => {
    const response = await apiClient.get(`/payment/status/${paymentId}`);
    return response.data;
  },
};