import api from '../api/axiosConfig';

export const getAllTables = () => api.get('/api/tables/all');
export const addTable = (data) => api.post('/api/tables', { ...data });
export const deleteTable = (number) => api.delete(`/api/tables/delete/${number}`);
export const assignTable = (table) => api.put(`/api/tables/assign/${table.number}/${table.status}`);
export const getByStatus = (status) => api.get(`/api/tables/status/${status}`);
