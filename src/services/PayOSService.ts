import { AuthService } from "./AuthService";
import type { ApiResult } from "@/types/api.types";
import type { PayOSCreatePaymentLinkRequest, PayOSCreatePaymentLinkResponse } from '@/types/payos.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const PayOSService = {
  createPaymentLink: async (data: PayOSCreatePaymentLinkRequest): Promise<ApiResult<PayOSCreatePaymentLinkResponse>> => {
    try {
      const response = await AuthService.fetchWithAuth(`${API_BASE_URL}/payos/create-payment-link`, {
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
};