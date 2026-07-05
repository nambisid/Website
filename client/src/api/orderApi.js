import api from './axiosInstance';

export const createOrder = (data) => api.post('/orders', data);
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (orderNumber) => api.get(`/orders/${orderNumber}`);
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);
