import { apiClient } from './AuthService';

const PaymentService = {
  createPayment: async (bookingId: string, returnUrl: string) => {
    try {
      const response = await apiClient.post('/Payment', {
        bookingId,
        returnUrl
      });
      if (response.data && response.data.data && response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },
};

export default PaymentService;