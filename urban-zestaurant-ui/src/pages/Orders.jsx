import React, { useEffect, useState, useContext } from 'react';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updateOrder,
    getAllTables,
    getAllMenuItems,
    assignTable,
    generateBill,
    getBillById
} from '../services/orderService';
import { AuthContext } from '../context/AuthContext';
import '../styles/Orders.css';

// Modal Component (keeping your existing pattern)
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                {children}
            </div>
        </div>
    );
};

function Orders() {
    // Existing state variables
    const [orders, setOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // POS interface state
    const [categories, setCategories] = useState(['All Menu']);
    const [selectedCategory, setSelectedCategory] = useState('All Menu');
    const [orderFilter, setOrderFilter] = useState('All');
    const [currentOrder, setCurrentOrder] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedItems, setSelectedItems] = useState({}); // Keep your existing pattern
    
    // Customer name state
    const [customerName, setCustomerName] = useState('');
    
    // Billing state
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [billData, setBillData] = useState(null);
    const [billingFormData, setBillingFormData] = useState({
        paymentMethod: 'CASH',
        taxPercent: 10.0
    });

    const { user } = useContext(AuthContext);
    const hasRole = (role) => user?.role === role;

    // Load initial data (using your existing functions)
    useEffect(() => {
        loadOrders();
        loadTables();
        loadMenuItems();
    }, []);

    // Reload orders when filter changes
    useEffect(() => {
        // Force re-render when filter changes
    }, [orderFilter]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await getAllOrders();
            // Sort by creation date (newest first)
            const sortedOrders = res.data.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTables = async () => {
        try {
            const res = await getAllTables();
            setTables(res.data || []);
        } catch (error) {
            console.error('Error loading tables:', error);
        }
    };

    const loadMenuItems = async () => {
        try {
            const res = await getAllMenuItems();
            // Filter only available menu items (your existing logic)
            const availableItems = res.data.filter(item => item.available);
            setMenuItems(availableItems);
            
            // Extract unique categories for POS interface
            const uniqueCategories = ['All Menu', ...new Set(availableItems.map(item => item.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error loading menu items:', error);
        }
    };

    // Status update functions
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const orderToUpdate = orders.find(order => order.orderId === orderId);
            
            await updateOrderStatus(orderId, newStatus);
            
            // Free table when order is SERVED or CANCELLED
            if ((newStatus === 'SERVED' || newStatus === 'CANCELLED') && orderToUpdate) {
                if (orderToUpdate.orderType === 'dinein' && orderToUpdate.tableNumber) {
                    try {
                        await assignTable({
                            number: orderToUpdate.tableNumber,
                            status: 'FREE'
                        });
                        loadTables(); // Refresh tables as one is now free
                    } catch (tableError) {
                        console.error('Error freeing table:', tableError);
                    }
                }
            }
            
            // If order is being marked as SERVED, show billing modal
            if (newStatus === 'SERVED') {
                if (orderToUpdate) {
                    setCurrentOrder(orderToUpdate);
                    setShowBillingModal(true);
                }
            }
            
            loadOrders();
            if (currentOrder && currentOrder.orderId === orderId) {
                // Update current order if it's being viewed
                const updatedOrder = await getOrderById(orderId);
                setCurrentOrder(updatedOrder.data);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error updating order status. Please try again.');
        }
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            'PENDING': 'PREPARING',
            'PREPARING': 'SERVED'
        };
        return statusFlow[currentStatus.toUpperCase()];
    };

    const canUpdateStatus = (status) => {
        return ['PENDING', 'PREPARING'].includes(status.toUpperCase());
    };

    const canCancelOrder = (status) => {
        return ['PENDING', 'PREPARING'].includes(status.toUpperCase());
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            await handleStatusUpdate(orderId, 'CANCELLED');
        }
    };

    // POS filtering functions
    const getFilteredOrders = () => {
        let filtered = orders;
        
        if (orderFilter !== 'All') {
            if (orderFilter === 'DINEIN') {
                filtered = filtered.filter(order => order.orderType.toUpperCase() === 'DINEIN');
            } else if (orderFilter.toUpperCase() === 'TAKEOUT') {
                filtered = filtered.filter(order => order.orderType.toUpperCase() === 'TAKEOUT');
            } else if (orderFilter.toUpperCase() === 'DELIVERY') {
                filtered = filtered.filter(order => order.orderType.toUpperCase() === 'DELIVERY');
            } else if (orderFilter.toUpperCase() === 'PENDING') {
                filtered = filtered.filter(order => order.orderStatus.toUpperCase() === 'PENDING');
            } else if (orderFilter.toUpperCase() === 'PREPARING') {
                filtered = filtered.filter(order => order.orderStatus.toUpperCase() === 'PREPARING');
            } else if (orderFilter.toUpperCase() === 'SERVED') {
                filtered = filtered.filter(order => order.orderStatus.toUpperCase() === 'SERVED');
            } else if (orderFilter.toUpperCase() === 'CANCELLED') {
                filtered = filtered.filter(order => order.orderStatus.toUpperCase() === 'CANCELLED');
            }
        }
        
        return filtered;
    };

    const getFilteredMenuItems = () => {
        if (selectedCategory === 'All Menu') {
            return menuItems;
        }
        return menuItems.filter(item => item.category === selectedCategory);
    };

    // Your existing quantity update function
    const updateItemQuantity = (menuItemId, quantity) => {
        // Prevent quantity changes for served/cancelled orders
        if (currentOrder && (currentOrder.orderStatus === 'SERVED' || currentOrder.orderStatus === 'CANCELLED')) {
            alert('Cannot modify a served or cancelled order');
            return;
        }
        
        setSelectedItems(prev => ({
            ...prev,
            [menuItemId]: Math.max(0, quantity)
        }));
    };

    // Calculate totals (your existing logic)
    const calculateSelectedTotal = () => {
        return Object.entries(selectedItems).reduce((total, [menuItemId, quantity]) => {
            const item = menuItems.find(item => item.id === parseInt(menuItemId));
            return total + (item ? item.price * quantity : 0);
        }, 0);
    };

    const calculateOrderTotal = (items) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Order management functions (updated for POS)
    const handleCreateOrder = async () => {
        if (!customerName.trim()) {
            alert('Please enter customer name');
            return;
        }

        if (!selectedTable) {
            alert('Please select a table');
            return;
        }

        if (Object.keys(selectedItems).filter(id => selectedItems[id] > 0).length === 0) {
            alert('Please select at least one menu item');
            return;
        }

        try {
            const items = Object.entries(selectedItems)
                .filter(([_, quantity]) => quantity > 0)
                .map(([menuItemId, quantity]) => ({
                    menuItemId: parseInt(menuItemId),
                    quantity: quantity
                }));

            const orderData = {
                customerName: customerName.trim(), // Use customer name input
                orderType: 'DINEIN',
                tableId: selectedTable.tableId,
                items: items
            };

            const response = await createOrder(orderData);
            setCurrentOrder(response.data);
            
            // Mark table as occupied (your existing logic)
            await assignTable({
                number: selectedTable.tableNumber,
                status: 'OCCUPIED'
            });

            // Reset and reload
            setSelectedItems({});
            setCustomerName('');
            loadOrders();
            loadTables();
            
            alert('Order created successfully!');
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Error creating order. Please try again.');
        }
    };

    const handleUpdateOrder = async () => {
        if (!currentOrder) return;

        if (!customerName.trim()) {
            alert('Please enter customer name');
            return;
        }

        try {
            const items = Object.entries(selectedItems)
                .filter(([_, quantity]) => quantity > 0)
                .map(([menuItemId, quantity]) => ({
                    menuItemId: parseInt(menuItemId),
                    quantity: quantity
                }));

            const updateData = {
                customerName: customerName.trim(),
                orderType: currentOrder.orderType,
                tableId: selectedTable?.tableId || null,
                items: items
            };

            await updateOrder(currentOrder.orderId, updateData);
            loadOrders();
            
            alert('Order updated successfully!');
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error updating order. Please try again.');
        }
    };

    const selectOrderForEditing = async (order) => {
        try {
            // Get full order details (your existing logic)
            const res = await getOrderById(order.orderId);
            setCurrentOrder(res.data);
            
            // Set customer name
            setCustomerName(res.data.customerName || '');
            
            // Find the table for this order
            const table = tables.find(t => t.tableNumber === order.tableNumber);
            setSelectedTable(table);
            
            // Set current order items only if order is not served/cancelled
            if (order.orderStatus !== 'SERVED' && order.orderStatus !== 'CANCELLED') {
                const items = {};
                res.data.items.forEach(item => {
                    const menuItem = menuItems.find(mi => mi.name === item.itemName);
                    if (menuItem) {
                        items[menuItem.id] = item.quantity;
                    }
                });
                setSelectedItems(items);
            } else {
                // Clear selected items for completed orders
                setSelectedItems({});
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            alert('Error loading order details. Please try again.');
        }
    };

    // Your existing billing function
    const handleGenerateBill = async () => {
        if (!currentOrder) return;

        try {
            const billPayload = {
                orderId: currentOrder.orderId,
                paymentMethod: billingFormData.paymentMethod,
                taxPercent: parseFloat(billingFormData.taxPercent)
            };

            const response = await generateBill(billPayload);
            setBillData(response.data);
            setShowBillingModal(true);
            
            // Table is already freed when order status is updated to SERVED
            
            loadOrders();
            alert('Bill generated successfully!');
        } catch (error) {
            console.error('Error generating bill:', error);
            alert('Error generating bill. Please try again.');
        }
    };

    

    const resetOrder = () => {
        setCurrentOrder(null);
        setSelectedTable(null);
        setSelectedItems({});
        setCustomerName('');
    };

    const getOrderStatusCounts = () => {
        const all = orders.length;
        const dinein = orders.filter(o => o.orderType.toUpperCase() === 'DINEIN').length;
        const takeout = orders.filter(o => o.orderType.toUpperCase() === 'TAKEOUT').length;
        const delivery = orders.filter(o => o.orderType.toUpperCase() === 'DELIVERY').length;
        const pending = orders.filter(o => o.orderStatus.toUpperCase() === 'PENDING').length;
        const preparing = orders.filter(o => o.orderStatus.toUpperCase() === 'PREPARING').length;
        const served = orders.filter(o => o.orderStatus.toUpperCase() === 'SERVED').length;
        const cancelled = orders.filter(o => o.orderStatus.toUpperCase() === 'CANCELLED').length;
        
        return { all, dinein, takeout, delivery, pending, preparing, served, cancelled };
    };

    const handleBillingInputChange = (e) => {
        const { name, value } = e.target;
        setBillingFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const closeBillingModal = () => {
        setShowBillingModal(false);
        setBillData(null);
        setBillingFormData({
            paymentMethod: 'CASH',
            taxPercent: 10.0
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const statusCounts = getOrderStatusCounts();
    const filteredOrders = getFilteredOrders();
    const filteredMenuItems = getFilteredMenuItems();

    return (
        <div className="restaurant-pos">
            {/* Left Panel - Order Status */}
            <div className="order-status-panel">
                <h2 className="panel-title">Order Line</h2>
                
                <div className="status-tabs">
                    {[
                        { label: 'All', count: statusCounts.all, color: '#3b82f6' },
                        { label: 'DINEIN', count: statusCounts.dinein, color: '#10b981' },
                        { label: 'TAKEOUT', count: statusCounts.takeout, color: '#f59e0b' },
                        { label: 'DELIVERY', count: statusCounts.delivery, color: '#8b5cf6' },
                        { label: 'PENDING', count: statusCounts.pending, color: '#ef4444' },
                        { label: 'PREPARING', count: statusCounts.preparing, color: '#3b82f6' },
                        { label: 'SERVED', count: statusCounts.served, color: '#10b981' },
                        { label: 'CANCELLED', count: statusCounts.cancelled, color: '#6b7280' }
                    ].map(status => (
                        <button 
                            key={status.label}
                            className={`status-tab ${orderFilter === status.label ? 'active' : ''}`}
                            style={{ '--tab-color': status.color }}
                            onClick={() => setOrderFilter(status.label)}
                        >
                            <span className="status-label">
                                {status.label === 'DINEIN' ? 'Dine In' :
                                 status.label === 'TAKEOUT' ? 'Take Out' :
                                 status.label === 'DELIVERY' ? 'Delivery' :
                                 status.label === 'PENDING' ? 'Pending' :
                                 status.label === 'PREPARING' ? 'Preparing' :
                                 status.label === 'SERVED' ? 'Served' :
                                 status.label === 'CANCELLED' ? 'Cancelled' : status.label}
                            </span>
                            <span className="status-count">{status.count}</span>
                        </button>
                    ))}
                </div>

                <div className="orders-list">
                    {filteredOrders.length === 0 ? (
                        <div className="no-orders">
                            <p>No orders found for "{orderFilter}" filter</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div 
                                key={order.orderId} 
                                className={`order-item ${currentOrder?.orderId === order.orderId ? 'selected' : ''} ${
                                    order.orderStatus === 'SERVED' || order.orderStatus === 'CANCELLED' ? 'order-completed' : ''
                                }`}
                                onClick={() => selectOrderForEditing(order)}
                            >
                                <div className="order-header">
                                    <span className="order-number">Order #{order.orderId}</span>
                                    <span className="table-number">Table {order.tableNumber || 'N/A'}</span>
                                    {(order.orderStatus === 'SERVED' || order.orderStatus === 'CANCELLED') && (
                                        <span className="locked-indicator" title="Cannot edit completed order">🔒</span>
                                    )}
                                </div>
                                <div className="order-details">
                                    <span className="customer-name">{order.customerName}</span>
                                    <span className="item-count">Items: {order.items.length}</span>
                                    <span className="order-time">
                                        {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className={`order-status-badge ${order.orderStatus.toLowerCase()}`}>
                                    {order.orderStatus}
                                </div>
                                
                                {/* Status Update Buttons */}
                                {(hasRole('ADMIN') || hasRole('MANAGER') || hasRole('CHEF')) && (
                                    <div className="order-actions-inline" onClick={(e) => e.stopPropagation()}>
                                        {canUpdateStatus(order.orderStatus) && (
                                            <button 
                                                className="btn-status-update"
                                                onClick={() => handleStatusUpdate(order.orderId, getNextStatus(order.orderStatus))}
                                                title={`Update to ${getNextStatus(order.orderStatus)}`}
                                            >
                                                {getNextStatus(order.orderStatus) === 'PREPARING' && '👨‍🍳'}
                                                {getNextStatus(order.orderStatus) === 'SERVED' && '🍽️'}
                                            </button>
                                        )}
                                        {canCancelOrder(order.orderStatus) && (
                                            <button 
                                                className="btn-cancel-inline"
                                                onClick={() => handleCancelOrder(order.orderId)}
                                                title="Cancel Order"
                                            >
                                                ❌
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Center Panel - Menu */}
            <div className="menu-panel">
                <div className="menu-header">
                    <h2 className="menu-title">Foodies Menu</h2>
                    
                    <div className="menu-categories">
                        {categories.map(category => {
                            const categoryItems = category === 'All Menu' ? menuItems : menuItems.filter(item => item.category === category);
                            return (
                                <button
                                    key={category}
                                    className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    <div className="category-icon">
                                        {category === 'All Menu' ? '🍽️' : 
                                         category === 'Special' ? '⭐' :
                                         category === 'Soups' ? '🍲' :
                                         category === 'Desserts' ? '🍰' :
                                         category === 'Chicken' ? '🍗' :
                                         category === 'Vegetarian' ? '🥗' :
                                         category === 'Seafood' ? '🍤' :
                                         category === 'Pasta' ? '🍝' :
                                         category === 'Rice' ? '🍚' :
                                         category === 'Beverages' ? '🥤' : '🥘'}
                                    </div>
                                    <div className="category-info">
                                        <span className="category-name">{category}</span>
                                        <span className="category-count">{categoryItems.length} Items</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="menu-grid">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} className="menu-item-card">
                            <div className="item-image">
                                <div className="placeholder-image">
                                    {item.category === 'Desserts' ? '🍰' :
                                     item.category === 'Soups' ? '🍲' :
                                     item.category === 'Chicken' ? '🍗' :
                                     item.category === 'Vegetarian' ? '🥗' :
                                     item.category === 'Seafood' ? '🍤' :
                                     item.category === 'Pasta' ? '🍝' :
                                     item.category === 'Rice' ? '🍚' :
                                     item.category === 'Bread' ? '🍞' :
                                     item.category === 'Beverages' ? '🥤' : '🍽️'}
                                </div>
                                {item.category === 'Special' && <div className="special-badge">🔥</div>}
                            </div>
                            
                            <div className="item-info">
                                <div className="item-category">{item.category}</div>
                                <div className="item-name">{item.name}</div>
                                <div className="item-price">₹{item.price}</div>
                            </div>

                            <div className="quantity-controls">
                                <button 
                                    className="qty-btn minus"
                                    onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) - 1)}
                                    disabled={!selectedItems[item.id] || selectedItems[item.id] === 0 || 
                                             (currentOrder && (currentOrder.orderStatus.toUpperCase() == 'SERVED' || currentOrder.orderStatus.toUpperCase() === 'CANCELLED'))}
                                >
                                    −
                                </button>
                                <span className="quantity">{selectedItems[item.id] || 0}</span>
                                <button 
                                    className="qty-btn plus"
                                    onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) + 1)}
                                    disabled={currentOrder && (currentOrder.orderStatus.toUpperCase() === 'SERVED' || currentOrder.orderStatus.toUpperCase() === 'CANCELLED')}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Order Summary */}
            <div className="order-summary-panel">
                <div className="summary-header">
                    <div className="customer-name-input">
                        <label className="input-label">Customer Name</label>
                        <input
                            type="text"
                            className="customer-name-field"
                            placeholder="Enter customer name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            disabled={currentOrder && (currentOrder.orderStatus === 'SERVED' || currentOrder.orderStatus === 'CANCELLED')}
                        />
                    </div>
                    
                    <div className="table-selector">
                        <label className="input-label">Select Table</label>
                        <select 
                            value={selectedTable?.tableId || ''} 
                            onChange={(e) => {
                                const table = tables.find(t => t.tableId === parseInt(e.target.value));
                                setSelectedTable(table);
                            }}
                            className="table-select"
                            disabled={currentOrder && (currentOrder.orderStatus === 'SERVED' || currentOrder.orderStatus === 'CANCELLED')}
                        >
                            <option value="">Select Table</option>
                            {tables.filter(t => t.status === 'free' || t.tableId === selectedTable?.tableId).map(table => (
                                <option key={table.tableId} value={table.tableId}>
                                    Table No #{table.tableNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    
                    {currentOrder && (
                        <div className="current-order-info">
                            <div className="order-number">Order #{currentOrder.orderId}</div>
                            <div className="people-count">👥 {selectedTable?.seatingCapacity || 2} People</div>
                            {(currentOrder.orderStatus === 'SERVED' || currentOrder.orderStatus === 'CANCELLED') && (
                                <div className="readonly-warning">
                                    🔒 This order is {currentOrder.orderStatus.toLowerCase()} and cannot be modified
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="ordered-items">
                    <h3 className="section-title">
                        Ordered Items 
                        <span className="items-count">
                            {Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0).toString().padStart(2, '0')}
                        </span>
                    </h3>
                    
                    <div className="items-list">
                        {Object.entries(selectedItems)
                            .filter(([_, quantity]) => quantity > 0)
                            .map(([menuItemId, quantity]) => {
                                const item = menuItems.find(mi => mi.id === parseInt(menuItemId));
                                if (!item) return null;
                                
                                return (
                                    <div key={menuItemId} className="ordered-item">
                                        <div className="item-details">
                                            <span className="item-qty">{quantity}x</span>
                                            <span className="item-title">{item.name}</span>
                                        </div>
                                        <div className="item-total">₹{(item.price * quantity).toFixed(2)}</div>
                                    </div>
                                );
                            })}
                        
                        {Object.keys(selectedItems).filter(id => selectedItems[id] > 0).length === 0 && (
                            <div className="no-items">No items selected</div>
                        )}
                    </div>
                </div>

                <div className="payment-summary">
                    <h3 className="section-title">Payment Summary</h3>
                    
                    <div className="summary-line">
                        <span>Subtotal</span>
                        <span>₹{calculateSelectedTotal().toFixed(2)}</span>
                    </div>
                    <div className="summary-line">
                        <span>Tax (10%)</span>
                        <span>₹{(calculateSelectedTotal() * 0.1).toFixed(2)}</span>
                    </div>
                    
                    <div className="total-line">
                        <span>Total Payable</span>
                        <span>₹{(calculateSelectedTotal() * 1.1).toFixed(2)}</span>
                    </div>
                </div>

                <div className="payment-methods">
                    {/* <h3 className="section-title">Payment Method</h3>
                    <div className="payment-options">
                        <button 
                            className={`payment-btn ${billingFormData.paymentMethod === 'CASH' ? 'active' : ''}`}
                            onClick={() => setBillingFormData(prev => ({...prev, paymentMethod: 'CASH'}))}
                        >
                            💵 Cash
                        </button>
                        <button 
                            className={`payment-btn ${billingFormData.paymentMethod === 'CARD' ? 'active' : ''}`}
                            onClick={() => setBillingFormData(prev => ({...prev, paymentMethod: 'CARD'}))}
                        >
                            💳 Card
                        </button>
                        <button 
                            className={`payment-btn ${billingFormData.paymentMethod === 'UPI' ? 'active' : ''}`}
                            onClick={() => setBillingFormData(prev => ({...prev, paymentMethod: 'UPI'}))}
                        >
                            📱 UPI
                        </button>
                    </div> */}
                </div>

                <div className="action-buttons">
                    <button className="action-btn print-btn"
                    
                    >
                        🖨️ Print
                    </button>
                    
                    {currentOrder ? (
                        <div className="order-actions">
                            <button 
                                className="action-btn update-btn"
                                onClick={handleUpdateOrder}
                                disabled={!customerName.trim() || 
                                         Object.keys(selectedItems).filter(id => selectedItems[id] > 0).length === 0 ||
                                         (currentOrder && (currentOrder.orderStatus === 'SERVED' || currentOrder.orderStatus === 'CANCELLED'))}
                            >
                                Update Order
                            </button>
                            {(currentOrder.orderStatus === 'PENDING' || currentOrder.orderStatus === 'PREPARING') && (
                                <button 
                                    className="action-btn bill-btn"
                                    onClick={handleGenerateBill}
                                >
                                    💳 Generate Bill
                                </button>
                            )}
                            <button 
                                className="action-btn reset-btn"
                                onClick={resetOrder}
                            >
                                New Order
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="action-btn place-order-btn"
                            onClick={handleCreateOrder}
                            disabled={!customerName.trim() || !selectedTable || Object.keys(selectedItems).filter(id => selectedItems[id] > 0).length === 0}
                        >
                            Place Order
                        </button>
                    )}
                </div>
            </div>

            {/* Billing Modal - Your existing pattern */}
            <Modal isOpen={showBillingModal} onClose={closeBillingModal}>
                <h3 className="modal-title">💳 Generate Bill</h3>
                
                {!billData ? (
                    <>
                        {currentOrder && (
                            <div className="billing-order-summary">
                                <div className="billing-info-grid">
                                    <div>
                                        <strong>Order ID:</strong> #{currentOrder.orderId}
                                    </div>
                                    <div>
                                        <strong>Customer:</strong> {currentOrder.customerName}
                                    </div>
                                    <div>
                                        <strong>Order Type:</strong> {currentOrder.orderType}
                                    </div>
                                    {currentOrder.tableNumber && (
                                        <div>
                                            <strong>Table:</strong> {currentOrder.tableNumber}
                                        </div>
                                    )}
                                </div>

                                <div className="billing-items-summary">
                                    <h4>Order Items:</h4>
                                    {currentOrder.items.map((item, index) => (
                                        <div key={index} className="billing-item">
                                            <span>{item.itemName} x {item.quantity}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="billing-subtotal">
                                        <strong>Subtotal:</strong>
                                        <strong>₹{calculateOrderTotal(currentOrder.items)}</strong>
                                    </div>
                                </div>

                                <div className="billing-form">
                                    <div className="form-group">
                                        <label className="form-label">Payment Method</label>
                                        <select
                                            className="form-input"
                                            name="paymentMethod"
                                            value={billingFormData.paymentMethod}
                                            onChange={handleBillingInputChange}
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="CARD">Card</option>
                                            <option value="UPI">UPI</option>
                                            <option value="WALLET">Wallet</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Tax Percentage (%)</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            name="taxPercent"
                                            value={billingFormData.taxPercent}
                                            onChange={handleBillingInputChange}
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                    </div>

                                    <div className="billing-calculation">
                                        <div className="calc-row">
                                            <span>Subtotal:</span>
                                            <span>₹{calculateOrderTotal(currentOrder.items).toFixed(2)}</span>
                                        </div>
                                        <div className="calc-row">
                                            <span>Tax ({billingFormData.taxPercent}%):</span>
                                            <span>₹{(calculateOrderTotal(currentOrder.items) * billingFormData.taxPercent / 100).toFixed(2)}</span>
                                        </div>
                                        <div className="calc-row total">
                                            <strong>Total:</strong>
                                            <strong>₹{(calculateOrderTotal(currentOrder.items) * (1 + billingFormData.taxPercent / 100)).toFixed(2)}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={closeBillingModal}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleGenerateBill}>
                                💳 Generate Bill
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="bill-receipt">
                        <div className="receipt-header">
                            <h4>Bill Receipt</h4>
                            <p>Bill ID: #{billData.billId}</p>
                        </div>

                        <div className="receipt-details">
                            <div className="receipt-row">
                                <span>Order ID:</span>
                                <span>#{billData.orderId}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Payment Method:</span>
                                <span>{billData.paymentMethod}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Payment Status:</span>
                                <span className="payment-status paid">{billData.paymentStatus}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Paid At:</span>
                                <span>{formatDateTime(billData.paidAt)}</span>
                            </div>
                        </div>

                        <div className="receipt-items">
                            <h5>Items:</h5>
                            {billData.items.map((item, index) => (
                                <div key={index} className="receipt-item">
                                    <div>
                                        <span>{item.item}</span>
                                        <span className="item-meta"> ({item.quantity} x ₹{item.unitPrice})</span>
                                    </div>
                                    <span>₹{item.total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="receipt-totals">
                            <div className="receipt-row">
                                <span>Subtotal:</span>
                                <span>₹{billData.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Tax:</span>
                                <span>₹{billData.tax.toFixed(2)}</span>
                            </div>
                            <div className="receipt-row total">
                                <strong>Total:</strong>
                                <strong>₹{billData.total.toFixed(2)}</strong>
                            </div>
                        </div>

                        <div className="modal-buttons">
                            <button className="btn-primary" onClick={closeBillingModal}>
                                ✅ Done
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Orders;