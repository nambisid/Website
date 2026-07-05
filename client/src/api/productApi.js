import api from './axiosInstance';

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (slug) => api.get(`/products/${slug}`);
export const getFeaturedProducts = () => api.get('/products/featured');
export const searchProducts = (params) => api.get('/products/search', { params });

// Admin
export const getAllProductsAdmin = () => api.get('/products/admin/all');
export const getProductByIdAdmin = (id) => api.get(`/products/admin/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
