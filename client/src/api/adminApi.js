import api from './axiosInstance';

export const getDashboard = () => api.get('/admin/dashboard');
export const getAllOrders = (params) => api.get('/admin/orders', { params });
export const updateOrderStatus = (id, data) => api.put(`/admin/orders/${id}/status`, data);
export const getLowStock = () => api.get('/admin/inventory');
export const getCustomers = (params) => api.get('/admin/customers', { params });
export const getReviewsForModeration = (params) => api.get('/admin/reviews', { params });
export const moderateReview = (id, isApproved) => api.put(`/admin/reviews/${id}/approve`, { isApproved });
export const getRevenue = (params) => api.get('/admin/revenue', { params });

// Categories
export const getCategories = () => api.get('/categories');
export const getAllCategoriesAdmin = () => api.get('/categories/admin/all');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Uploads — let the browser set the Content-Type (with boundary) automatically by passing undefined
export const uploadImages = (formData) =>
  api.post('/uploads/images', formData, { headers: { 'Content-Type': undefined } });
export const deleteImage = (publicId) => api.delete(`/uploads/images/${publicId}`);

// User management
export const listAllUsers = (params) => api.get('/admin/users', { params });
export const updateUserRole = (id, role) =>
  api.put(`/admin/users/${id}/role`, { role });
