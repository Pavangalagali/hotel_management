import api from '../api/axiosConfig';

// Menu Items
export const getAllMenuItems = () => api.get('/api/menu');
export const addMenuItem = (data) => api.post('/api/menu', data);
export const updateMenuItem = (id, data) => api.put(`/api/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/api/menu/${id}`);

export const getByAvailability = (status) => api.get(`/api/menu/available/${status}`);
export const getByCategory = (categoryId) => api.get(`/api/menu/category/${categoryId}`);

// Categories
export const getAllCategories = () => api.get('/api/menu/categories/all');
export const addCategory = (name) => api.post(`/api/menu/categories?name=${encodeURIComponent(name)}`);