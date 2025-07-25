export interface ProcessPaymentDto {
  bookingId: string;
  amount: number;
  paymentMethod: string;
}

export interface ProcessPaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface GenerateQrCodeDto {
  amount: number;
  addInfo: string;
}

export interface GenerateQrCodeResponse {
  qrDataURL: string;
}