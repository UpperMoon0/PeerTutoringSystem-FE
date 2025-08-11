export interface PayOSCreatePaymentLinkRequest {
    orderCode: number;
    amount: number;
    description: string;
    cancelUrl: string;
    returnUrl: string;
    items?: { name: string; quantity: number; price: number }[];
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
  