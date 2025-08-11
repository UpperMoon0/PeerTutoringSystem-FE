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
  totalRevenue: number;
  averageTransactionValue: number;
  totalTransactions: number;
  monthlyRevenue: { month: string; revenue: number }[];
  recentTransactions: {
    transactionId: string;
    transactionDate: string;
    amount: number;
    status: string;
    bookingId: string;
  }[];
}
export interface TransactionHistory {
  transactionId: string;
  transactionDate: string;
  amount: number;
  status: string;
  bookingId: string;
}