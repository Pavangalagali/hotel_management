import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import {
    assignTable
} from '../services/orderService';
import Alert from './Alert';
import '../styles/kds.css';

const KDS = () => {
    const { user } = useContext(AuthContext);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [currentTime, setCurrentTime] = useState(new Date());

    // View mode state - 'ALL' or specific status
    const [currentView, setCurrentView] = useState('ALL');

    // Column visibility toggles (keeping for backward compatibility)
    const [columnVisibility, setColumnVisibility] = useState({
        ALL: true,
        PENDING: true,
        PREPARING: true,
        SERVED: true,
        CANCELLED: true
    });

    // Toggle view mode
    const toggleView = (viewMode) => {
        setCurrentView(viewMode);
        // Update column visibility for the selected view
        setColumnVisibility(prev => ({
            ...prev,
            [viewMode]: true
        }));
    };

    // Get filtered and sorted orders
    const getFilteredAndSortedOrders = () => {
        let filteredOrders = [];

        if (currentView === 'ALL') {
            filteredOrders = [...allOrders];
        } else {
            filteredOrders = allOrders.filter(order =>
                order.orderStatus?.toUpperCase() === currentView.toUpperCase()
            );
        }

        // Sort by creation time (newest first)
        return filteredOrders.sort((a, b) => {
            const timeA = new Date(a.createdAt);
            const timeB = new Date(b.createdAt);
            return timeB - timeA; // Newest first
        });
    };

    // Group orders by status (for stats)
    const getOrdersByStatus = (status) => {
        return allOrders.filter(order =>
            order.orderStatus?.toUpperCase() === status.toUpperCase()
        );
    };

    // Load all orders
    const loadOrders = async () => {
        try {
            setLoading(true);
            const result = await getAllOrders();

            if (result?.data) {
                setAllOrders(result.data);
                setAlert({ message: '', type: '' });
            } else {
                setAlert({ message: 'No orders found', type: 'info' });
            }
        } catch (err) {
            console.error('Error loading orders:', err);
            setAlert({ message: 'Failed to load orders. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Handle status updates
    const handleStatusUpdate = async (orderId, newStatus, tableNumber) => {
        try {
            
            const result = await updateOrderStatus(orderId, newStatus);
            
            if (result?.data) {
                console.log(result.data);
                console.log("table number ==> ", result.data.tableNumber)
                const statusMessages = {
                    'PREPARING': 'Order moved to kitchen! 🔥',
                    'SERVED': 'Order completed successfully! ✅',
                    'CANCELLED': 'Order cancelled ❌'
                };
                if (result.data.tableNumber && (newStatus === 'SERVED' || newStatus === 'CANCELLED')) {

                    try {
                        await assignTable({
                            number: tableNumber,
                            status: 'FREE'
                        });
                    } catch (tableError) {
                        console.error('Error freeing table:', tableError);
                    }

                }
                setAlert({
                    message: statusMessages[newStatus] || 'Order status updated successfully!',
                    type: 'success'
                });
                await loadOrders();
            } else {
                setAlert({ message: 'Failed to update order status', type: 'error' });
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            setAlert({ message: 'Failed to update order status. Please try again.', type: 'error' });
        }
    };

    // Manual refresh
    const handleManualRefresh = async () => {
        await loadOrders();
        if (!alert.message || alert.type !== 'error') {
            setAlert({ message: 'Orders refreshed successfully! 🔄', type: 'success' });
        }
    };

    // Effects
    useEffect(() => {
        loadOrders();
        const refreshInterval = setInterval(loadOrders, 30000);
        return () => clearInterval(refreshInterval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (alert.message) {
            const timeout = setTimeout(() => setAlert({ message: '', type: '' }), 4000);
            return () => clearTimeout(timeout);
        }
    }, [alert]);

    // Helper functions
    const getStatusConfig = (status) => {
        switch (status.toUpperCase()) {
            case 'PENDING':
                return {
                    title: 'Pending',
                    icon: '⏳',
                    color: '#8D6E63',
                    bgColor: '#EFEBE9',
                    borderColor: '#8D6E63'
                };
            case 'PREPARING':
                return {
                    title: 'In Kitchen',
                    icon: '👨‍🍳',
                    color: '#5D4037',
                    bgColor: '#F3E5F5',
                    borderColor: '#5D4037'
                };
            case 'SERVED':
                return {
                    title: 'Completed',
                    icon: '✅',
                    color: '#388E3C',
                    bgColor: '#E8F5E8',
                    borderColor: '#388E3C'
                };
            case 'CANCELLED':
                return {
                    title: 'Cancelled',
                    icon: '❌',
                    color: '#D32F2F',
                    bgColor: '#FFEBEE',
                    borderColor: '#D32F2F'
                };
            default:
                return {
                    title: status,
                    icon: '📋',
                    color: '#616161',
                    bgColor: '#F5F5F5',
                    borderColor: '#616161'
                };
        }
    };

    const getTimeSince = (createdAt) => {
        const now = new Date();
        const orderTime = new Date(createdAt);
        const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTotalItemCount = (items) => {
        return items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
    };

    // Enhanced Order Card Component with Status Badge
    const OrderCard = ({ order }) => {
        const statusConfig = getStatusConfig(order.orderStatus);
        const totalItems = getTotalItemCount(order.items);

        return (
            <div className="classic-order-card" style={{ borderLeftColor: statusConfig.color, borderLeftWidth: '4px' }}>
                {/* Header with Status Badge */}
                <div className="classic-order-header">
                    <div className="order-id">#{order.orderId}</div>
                    <div className="order-status-badge" style={{
                        background: statusConfig.bgColor,
                        color: statusConfig.color,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        border: `1px solid ${statusConfig.color}`
                    }}>
                        {statusConfig.icon} {statusConfig.title}
                    </div>
                </div>

                {/* Time and Table Info */}
                <div className="order-meta">
                    <div className="order-time" style={{ fontSize: '0.8rem', color: '#6C757D', marginBottom: '0.5rem' }}>
                        {getTimeSince(order.createdAt)}
                    </div>
                </div>

                {/* Table Info */}
                <div className="">
                    <span className="table-label">Table:</span>
                    <span className="table-number">
                        {order.tableNumber ? `#${order.tableNumber}` : 'Takeaway'}
                    </span>
                </div>


                {/* Items */}
                <div className="items-section">
                    <div className="items-list">
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => (
                                <div key={index} className="item-row">
                                    <span className="quantity">{item.quantity}×</span>
                                    <span className="item-name">{item.itemName}</span>
                                </div>
                            ))
                        ) : (
                            <div className="no-items">No items</div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="classic-actions">
                    {order.orderStatus?.toUpperCase() === 'PENDING' && (
                        <button
                            className="action-btn start-btn"
                            onClick={() => handleStatusUpdate(order.orderId, 'PREPARING')}
                        >
                            Start
                        </button>
                    )}

                    {order.orderStatus?.toUpperCase() === 'PREPARING' && (
                        <button
                            className="action-btn complete-btn"
                            onClick={() => handleStatusUpdate(order.orderId, 'SERVED', order.tableNumber)}
                        >
                            Complete
                        </button>
                    )}

                    {(order.orderStatus?.toUpperCase() === 'PENDING' ||
                        order.orderStatus?.toUpperCase() === 'PREPARING') && (
                            <button
                                className="action-btn cancel-btn"
                                onClick={() => handleStatusUpdate(order.orderId, 'CANCELLED', order.tableNumber)}
                            >
                                Cancel
                            </button>
                        )}
                </div>
            </div>
        );
    };

    // Get order counts for stats
    const pendingOrders = getOrdersByStatus('PENDING');
    const preparingOrders = getOrdersByStatus('PREPARING');
    const servedOrders = getOrdersByStatus('SERVED');
    const cancelledOrders = getOrdersByStatus('CANCELLED');
    const totalOrders = allOrders.length;
    const activeOrders = pendingOrders.length + preparingOrders.length;

    // Get current filtered orders
    const displayOrders = getFilteredAndSortedOrders();

    if (loading && allOrders.length === 0) {
        return (
            <div className="classic-kds-container">
                <div className="classic-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="classic-kds-container">
            {/* Alert Component */}
            {alert.message && (
                <Alert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert({ message: '', type: '' })}
                />
            )}

            {/* Header */}
            <div className="classic-kds-header">
                <div className="header-left">
                    {/* <h1 className="kds-title">Kitchen Display System</h1> */}
                    <div className="header-stats">
                        <span>Total: {totalOrders}</span>
                        <span>Active: {activeOrders}</span>
                    </div>
                </div>

                <div className="header-controls">
                    {/* View Toggle Buttons */}
                    <div className="column-toggles">
                        <span className="toggles-label">View:</span>
                        {[
                            { key: 'ALL', label: 'All Orders', icon: '📋', count: totalOrders },
                            { key: 'PENDING', label: 'Pending', icon: '⏳', count: pendingOrders.length },
                            { key: 'PREPARING', label: 'Kitchen', icon: '👨‍🍳', count: preparingOrders.length },
                            { key: 'SERVED', label: 'Complete', icon: '✅', count: servedOrders.length },
                            { key: 'CANCELLED', label: 'Cancel', icon: '❌', count: cancelledOrders.length }
                        ].map(({ key, label, icon, count }) => (
                            <button
                                key={key}
                                className={`toggle-btn ${currentView === key ? 'active' : ''}`}
                                onClick={() => toggleView(key)}
                                title={`Show ${label} (${count})`}
                            >
                                {icon} {label} ({count})
                            </button>
                        ))}
                    </div>

                    <button
                        className="refresh-btn"
                        onClick={handleManualRefresh}
                        disabled={loading}
                    >
                        {loading ? '⟳' : '↻'} Refresh
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="classic-kds-content">
                {totalOrders === 0 ? (
                    <div className="classic-empty-state">
                        <h2>No Orders</h2>
                        <p>Kitchen is ready for new orders</p>
                    </div>
                ) : displayOrders.length === 0 ? (
                    <div className="classic-empty-state">
                        <h2>No {currentView === 'ALL' ? 'Orders' : getStatusConfig(currentView).title + ' Orders'}</h2>
                        <p>No orders found for this filter</p>
                    </div>
                ) : (
                    <div className="all-orders-grid">
                        {displayOrders.map((order) => (
                            <OrderCard key={order.orderId} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KDS;