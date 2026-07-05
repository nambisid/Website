import api from './axiosInstance';

export const getProductReviews = (productId, params) => api.get(`/reviews/product/${productId}`, { params });
export const createReview = (productId, data) => api.post(`/reviews/product/${productId}`, data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
