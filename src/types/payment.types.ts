export interface ProcessPaymentDto {
  bookingId: string;
  amount: number;
  paymentMethod: string;
}

export interface ProcessPaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
}