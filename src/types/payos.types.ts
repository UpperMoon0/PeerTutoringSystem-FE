export interface PayOSCreatePaymentLinkRequest {
    bookingId: string;
  }
  
  export interface PayOSCreatePaymentLinkResponse {
    code: string;
    desc: string;
    data: {
      bin: string;
      accountNumber: string;
      accountName: string;
      amount: number;
      description: string;
      orderCode: number;
      paymentLinkId: string;
      status: string;
      checkoutUrl: string;
      qrCode: string;
    };
    signature: string;
  }
  