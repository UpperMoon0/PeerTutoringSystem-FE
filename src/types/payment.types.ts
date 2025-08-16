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
  bookingId: string;
  ReturnUrl: string;
}

export interface GenerateQrCodeResponse {
  qrCode: string;
}

export interface AdminFinanceDetails {
  totalPayments: number;
  totalIncome: number;
  totalProfit: number;
}
export interface Payment {
  id: string;
  transactionId: string;
  studentName: string;
  tutorName: string;
  amount: number;
  status: string;
  createdAt: string;
  bookingId: string;
}

export interface TransactionHistory {
  transactionId: string;
  transactionDate: string;
  amount: number;
  status: string;
  bookingId: string;
}