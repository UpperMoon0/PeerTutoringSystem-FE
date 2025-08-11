import { AuthService } from "./AuthService";
import type { ApiResult } from "@/types/api.types";
import type {
  ProcessPaymentDto,
  ProcessPaymentResponse,
  GenerateQrCodeDto,
  GenerateQrCodeResponse,
  AdminFinanceDetails,
} from '@/types/payment.types';
import type { PayOSCreatePaymentLinkRequest, PayOSCreatePaymentLinkResponse } from '@/types/payos.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const PaymentService = {
  processPayment: async (data: ProcessP