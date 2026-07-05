import api from './axiosInstance';

export const getPublicConfig = () => api.get('/config/public');
