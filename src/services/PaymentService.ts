import { AuthService } from "./AuthService";
import type { ApiResult } from "@/types/api.types";
import type { ProcessPaymentDto, ProcessPaymentResponse } from "@/types/payment.types";

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
};