import axios from 'axios';

const API_BASE_URL = '/api/kds';

// Create axios instance with auth interceptor
const kdsApi = axios.create({
    baseURL: API_BASE_URL,
});

// Add auth token to requests
kdsApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Get all pending orders for kitchen display
export const getPendingOrders = async () => {
    try {
        const response = await kdsApi.get('/pending');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        
        // More detailed error messages
        let errorMessage = 'Failed to fetch pending orders';
        if (error.response?.status === 401) {
            errorMessage = 'Session expired. Please login again.';
        } else if (error.response?.status === 403) {
            errorMessage = 'Access denied. Insufficient permissions.';
        } else if (error.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
        } else if (!error.response) {
            errorMessage = 'Network error. Check your connection.';
        }
        
        return {
            success: false,
            error: error.response?.data?.message || errorMessage
        };
    }
};

// Update order status (PENDING -> PREPARING -> SERVED)
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await kdsApi.put(`/update-status/${orderId}`, null, {
            params: { status }
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error updating order status:', error);
        
        // More detailed error messages
        let errorMessage = 'Failed to update order status';
        if (error.response?.status === 401) {
            errorMessage = 'Session expired. Please login again.';
        } else if (error.response?.status === 403) {
            errorMessage = 'Access denied. Insufficient permissions.';
        } else if (error.response?.status === 404) {
            errorMessage = 'Order not found. It may have been cancelled.';
        } else if (error.response?.status === 400) {
            errorMessage = 'Invalid status update. Please refresh and try again.';
        } else if (error.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
        } else if (!error.response) {
            errorMessage = 'Network error. Check your connection.';
        }
        
        return {
            success: false,
            error: error.response?.data?.message || errorMessage
        };
    }
};

// Helper function to get orders by specific status (if needed in the future)
export const getOrdersByStatus = async (status) => {
    try {
        const response = await kdsApi.get(`/orders/status/${status}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error(`Error fetching orders with status ${status}:`, error);
        return {
            success: false,
            error: error.response?.data?.message || `Failed to fetch ${status} orders`
        };
    }
};

// Export all KDS related functions
export default {
    getPendingOrders,
    updateOrderStatus,
    getOrdersByStatus
};