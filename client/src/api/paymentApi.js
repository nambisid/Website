import api from './axiosInstance';

export const createRazorpayOrder = () => api.post('/payments/razorpay/create-order');
export const verifyRazorpayPayment = (payload) =>
  api.post('/payments/razorpay/verify', payload);
