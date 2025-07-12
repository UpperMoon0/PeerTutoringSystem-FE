import { apiClient } from './AuthService';

const PaymentService = {
  createPayment: async (bookingId: string, returnUrl: string) => {
    try {
      const response = await apiClient.post('/payment/create-payment', {
        bookingId,
        returnUrl,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },
};

export default PaymentService;