import { apiClient } from './AuthService';

const PaymentService = {
  createPayment: async (bookingId: string, returnUrl: string) => {
    try {
      const response = await apiClient.post('/api/Payment', {
        bookingId,
        returnUrl
      });
      if (response.data) {
        window.location.href = response.data;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },
};

export default PaymentService;