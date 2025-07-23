import api from '../api/axiosConfig';

// Order Management APIs
export const createOrder = (data) => api.post('/api/orders', data);
export const getAllOrders = () => api.get('/api/orders');
export const getOrderById = (orderId) => api.get(`/api/orders/${orderId}`);
export const updateOrderStatus = (orderId, status) => api.put(`/api/orders/${orderId}/status?status=${status}`);
export const updateOrder = (orderId, data) => api.put(`/api/orders/${orderId}`, data);

// Re-export from existing services for convenience
export { getAllTables ,assignTable } from './tableService';
export { getAllMenuItems } from './menuService';

export const generateBill = (data) => api.post('/api/billing/generate', data);
export const getBillById = (id) => api.get(`api/billing/order/${id}`);