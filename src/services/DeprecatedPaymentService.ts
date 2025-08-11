import { AuthService } from "./AuthService";
import type { ApiResult } from "@/types/api.types";
import type {
  ProcessPaymentDto,
  ProcessPaymentResponse,
  GenerateQrCodeDto,
  GenerateQrCodeResponse,
  AdminFinanceDetails,
} from '@/types/payment.types';

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

  generateQrCode: async (data: GenerateQrCodeDto): Promise<ApiResult<GenerateQrCodeResponse>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/payment/create-payment`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        throw new Error(errorData.error || `Failed to generate QR code: ${response.statusText}`);
      }
      const responseData = await response.json();
      // The backend response is not wrapped in a 'data' object, so we construct it to match the ApiResult type.
      if (responseData.success) {
        return { success: true, data: { qrCode: responseData.qrCode } };
      } else {
        return { success: false, error: responseData.message || 'Failed to generate QR code.' };
      }
    } catch (error: unknown) {
      console.error('Error generating QR code:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to generate QR code.' };
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
  }
};