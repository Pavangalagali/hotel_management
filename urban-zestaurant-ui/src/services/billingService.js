import api from '../api/axiosConfig';

// Billing Management APIs
export const getAllBills = () => api.get('/api/billing/all');
export const getBillsByOrderId = (orderId) => api.get(`/api/billing/order/${orderId}`);
export const generateBill = (data) => api.post('/api/billing/generate', data);

export const getDailyReport = (date) => api.get(`http://localhost:8080/api/reports/daily?date=${date}`)
export const getMonthlyReport = (date) => api.get(`http://localhost:8080/api/reports/monthly?year=${date.year}&month=${date.month}`)

