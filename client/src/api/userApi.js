import api from './axiosInstance';

export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);
export const changePassword = (data) => api.put('/users/me/password', data);
