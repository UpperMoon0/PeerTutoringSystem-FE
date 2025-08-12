import { AuthService } from "./AuthService";
import type { ApiResult } from "@/types/api.types";
import type {
  ProcessPaymentDto,
  ProcessPaymentResponse,
  GenerateQrCodeDto,
  GenerateQrCodeResponse,
  AdminFinanceDetails,
  TransactionHistory,
} from '@/types/payment.types';
import type { PayOSCreatePaymentLinkRequest, PayOSCreatePaymentLinkResponse } from '@/types/payos.types';
import { apiClient } from './AuthService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const PaymentService = {
  processP