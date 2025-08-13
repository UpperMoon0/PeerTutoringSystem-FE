export interface CreateWithdrawRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
}

export interface WithdrawRequest {
  id: string;
  tutorId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Canceled';
}