import React, { useEffect, useState, useContext } from 'react';
import {
    getAllTables,
    addTable,
    deleteTable,
    assignTable,
} from '../services/tableService';
import { getAllOrders } from '../services/orderService';
import { AuthContext } from '../context/AuthContext';
import '../styles/Table.css';

// Modal Component
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

// Delete Confirmation Popup Component
const DeleteConfirmationPopup = ({ isOpen, onClose, onConfirm, tableNumber }) => {
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
                <h3 className="modal-title">Confirm Delete</h3>
                <p style={{ marginBottom: '24px', color: '#4a5568' }}>
                    Are you sure you want to delete Table #{tableNumber}? This action cannot be undone.
                </p>
                <div className="modal-buttons">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-delete" onClick={onConfirm}>
                        Delete Table
                    </button>
                </div>
            </div>
        </div>
    );
};

// Create Order Modal Component
const CreateOrderModal = ({ isOpen, onClose, table }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderItems, setOrderItems] = useState([]);

    const handleCreateOrder = () => {
        // Here you would call your order creation API
        console.log('Creating order for table:', table?.tableNumber, {
            customerName,
            customerPhone,
            orderItems
        });
        // After creating order, close modal and refresh data
        onClose();
        setCustomerName('');
        setCustomerPhone('');
        setOrderItems([]);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h3 className="modal-title">Create Order - Table #{table?.tableNumber}</h3>
                
                <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Enter customer name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Customer Phone</label>
                    <input
                        className="form-input"
                        type="tel"
                        placeholder="Enter phone number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Order Items</label>
                    <div style={{ 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        padding: '12px',
                        minHeight: '100px',
                        background: '#f8fffe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#90a4ae',
                        fontSize: '14px'
                    }}>
                        Order items will be added here
                        <br />
                        (This would integrate with your menu system)
                    </div>
                </div>
                
                <div className="modal-buttons">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={handleCreateOrder}
                        disabled={!customerName.trim()}
                    >
                        Create Order & Assign Table
                    </button>
                </div>
            </div>
        </div>
    );
};

function Tables() {
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [newCapacity, setNewCapacity] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableToDelete, setTableToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // New state for date navigation
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);

    const { user } = useContext(AuthContext);

    const hasRole = (role) => user?.role === role;

    // Check if selected date is in the past
    const isPastDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        return selected < today;
    };

    // Date navigation functions
    const goToPreviousDay = () => {
        const previousDay = new Date(selectedDate);
        previousDay.setDate(previousDay.getDate() - 1);
        setSelectedDate(previousDay);
    };

    const goToNextDay = () => {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedDate(nextDay);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const formatDisplayDate = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    useEffect(() => {
        loadTables();
        loadOrders();
    }, []);

    // Get orders for the selected date with full details
    const getOrdersForDate = (date) => {
        const dateString = date.toISOString().split('T')[0];
        return orders.filter(order => {
            // Assuming your order has a createdAt or orderDate field
            const orderDate = new Date(order.createdAt || order.orderDate);
            return orderDate.toISOString().split('T')[0] === dateString;
        });
    };

    // Get only tables with active orders for the selected date
    const getTablesWithOrders = () => {
        const dateOrders = getOrdersForDate(selectedDate);
        const tablesWithOrders = [];
        
        dateOrders.forEach(order => {
            if (order.tableNumber) {
                const table = tables.find(t => t.tableNumber === order.tableNumber);
                if (table) {
                    // Add order info to table object
                    tablesWithOrders.push({
                        ...table,
                        orderInfo: order
                    });
                }
            }
        });
        
        return tablesWithOrders;
    };

    // Get order status color
    const getOrderStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return '#ff9800';
            case 'PREPARING': return '#2196f3';
            case 'READY': return '#4caf50';
            case 'SERVED': return '#8bc34a';
            case 'CANCELLED': return '#f44336';
            default: return '#757575';
        }
    };

    const loadTables = async () => {
        setLoading(true);
        try {
            const res = await getAllTables();
            setTables(res.data);
        } catch (error) {
            console.error('Error loading tables:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const res = await getAllOrders();
            setOrders(res.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    // Get customer name and order status for assigned table on selected date
    const getTableCustomerAndOrder = (tableNumber) => {
        const dateOrders = getOrdersForDate(selectedDate);
        const order = dateOrders.find(order => 
            order.tableNumber === tableNumber && 
            ['PENDING', 'PREPARING', 'READY', 'SERVED'].includes(order.orderStatus?.toUpperCase())
        );
        return order || null;
    };

    // Get customer name for assigned table on selected date (only for active orders, not served)
    const getTableCustomer = (tableNumber) => {
        const dateOrders = getOrdersForDate(selectedDate);
        const order = dateOrders.find(order => 
            order.tableNumber === tableNumber && 
            ['PENDING', 'PREPARING', 'READY'].includes(order.orderStatus?.toUpperCase()) // Exclude SERVED
        );
        return order ? order.customerName || 'Customer' : null;
    };

    // Get table status class based on active orders only
    const getTableStatusClass = (table) => {
        const customer = getTableCustomer(table.tableNumber);
        if (customer) {
            return 'table-occupied';
        }
        return 'table-available';
    };

    // Filter tables based on selected date - show all tables but with date-specific data
    const getFilteredTables = () => {
        // We show all tables but the customer assignment is based on selected date
        return tables;
    };

    // Get table statistics for selected date (only count active orders, not served)
    const getTableStats = () => {
        const dateOrders = getOrdersForDate(selectedDate);
        const activeOrders = dateOrders.filter(order => 
            order.tableNumber && 
            ['PENDING', 'PREPARING', 'READY'].includes(order.orderStatus?.toUpperCase())
        );
        
        const totalTables = tables.length;
        const occupiedCount = activeOrders.length; // Only count tables with active orders
        const availableCount = totalTables - occupiedCount;

        return { 
            availableCount, 
            occupiedCount, 
            total: totalTables,
            activeOrders: dateOrders.length // Total orders including served
        };
    };

    const handleAdd = async () => {
        if (!newTableNumber || !newCapacity) {
            alert('Please fill in all fields');
            return;
        }
        
        try {
            await addTable({ tableNumber: newTableNumber, capacity: newCapacity });
            setNewTableNumber('');
            setNewCapacity('');
            setShowModal(false);
            loadTables();
        } catch (error) {
            console.error('Error adding table:', error);
            alert('Error adding table. Please try again.');
        }
    };

    const handleFreeTable = async (table) => {
        try {
            const data = {
                number: table.tableNumber,
                status: "FREE"
            };
            await assignTable(data);
            loadTables();
            loadOrders();
        } catch (error) {
            console.error('Error freeing table:', error);
            alert('Error freeing table. Please try again.');
        }
    };

    const handleDelete = async (number) => {
        setTableToDelete(number);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteTable(tableToDelete);
            loadTables();
            setShowDeletePopup(false);
            setTableToDelete(null);
        } catch (error) {
            console.error('Error deleting table:', error);
            alert('Error deleting table. Please try again.');
        }
    };

    const cancelDelete = () => {
        setShowDeletePopup(false);
        setTableToDelete(null);
    };

    const openAssignModal = (table) => {
        setSelectedTable(table);
        setShowCreateOrderModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setNewTableNumber('');
        setNewCapacity('');
    };

    const getTableIcon = (capacity) => {
        if (capacity <= 2) return '🪑';
        if (capacity <= 4) return '🍽️';
        if (capacity <= 6) return '🏛️';
        return '🏢';
    };

    const filteredTables = getFilteredTables();
    const stats = getTableStats();

    return (
        <div className="tables-container">
            <div className="tables-header">
                <div className="header-left">
                    <div className="status-legend">
                        <div className="legend-item">
                            <span className="legend-dot available"></span>
                            <span>Available</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot occupied"></span>
                            <span>Occupied</span>
                        </div>
                    </div>
                </div>
                {(hasRole('ADMIN') || hasRole('MANAGER')) && (
                    <button className="btn-add-table" onClick={() => setShowModal(true)}>
                        <span className="plus-icon">+</span>
                        Add Table
                    </button>
                )}
            </div>

            <div className="tables-layout">
                {/* Left Sidebar - Active Orders with Date Filter */}
                <div className="assigned-tables-sidebar">
                    {/* Date Navigation Section */}
                    <div className="sidebar-filter">
                        <div className="filter-group">
                            <div className="date-navigation">
                                <button 
                                    className="date-nav-btn"
                                    onClick={goToPreviousDay}
                                    title="Previous day"
                                >
                                    &#8249;
                                </button>
                                <button 
                                    className="date-display"
                                    onClick={goToToday}
                                    title="Go to today"
                                >
                                    {formatDisplayDate(selectedDate)}
                                </button>
                                <button 
                                    className="date-nav-btn"
                                    onClick={goToNextDay}
                                    title="Next day"
                                >
                                    &#8250;
                                </button>
                            </div>
                        </div>
                        
                        <div className="filter-stats">
                            <div className="stat-item">
                                <span className="stat-dot available"></span>
                                <span>{stats.availableCount} Available</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-dot occupied"></span>
                                <span>{stats.occupiedCount} Occupied</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-header">
                        <h3>Active Orders</h3>
                        <span className="table-count">
                            {stats.activeOrders} Total
                        </span>
                    </div>
                    
                    <div className="assigned-tables-list">
                        {getTablesWithOrders().length === 0 ? (
                            <div className="no-tables">
                                <div className="no-tables-icon">📋</div>
                                <p>No orders found</p>
                                <small>Orders for {formatDisplayDate(selectedDate)} will appear here</small>
                            </div>
                        ) : (
                            getTablesWithOrders().map((table) => {
                                const order = table.orderInfo;
                                
                                return (
                                    <div 
                                        key={`${table.tableId}-${order.orderId}`} 
                                        className={`assigned-table-item table-occupied`}
                                    >
                                        <div className="assigned-table-header">
                                            <div className="table-badge">
                                                <span className="table-number">#{table.tableNumber}</span>
                                                <span className="table-capacity">👥 {table.capacity}</span>
                                            </div>
                                            <div className="order-status-badge" style={{ 
                                                backgroundColor: getOrderStatusColor(order.orderStatus),
                                                color: 'white',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '8px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase'
                                            }}>
                                                {order.orderStatus}
                                            </div>
                                        </div>
                                        
                                        <div className="customer-details">
                                            <div className="customer-avatar">
                                                {order.customerName?.charAt(0).toUpperCase() || 'C'}
                                            </div>
                                            <div className="customer-info-sidebar">
                                                <div className="customer-name-sidebar">{order.customerName || 'Customer'}</div>
                                                <div className="dining-status">Order #{order.orderId}</div>
                                            </div>
                                        </div>

                                        <div className="order-details-sidebar">
                                            <div className="order-time" style={{
                                                fontSize: '9px',
                                                color: '#546e7a',
                                                marginBottom: '4px'
                                            }}>
                                                🕒 {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            {order.totalAmount && (
                                                <div className="order-amount" style={{
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    color: '#26a69a'
                                                }}>
                                                    💰 ₹{order.totalAmount}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* {(hasRole('ADMIN') || hasRole('CASHIER') || hasRole('MANAGER')) && 
                                         order.orderStatus?.toUpperCase() !== 'SERVED' && 
                                         order.orderStatus?.toUpperCase() !== 'CANCELLED' && (
                                            <button 
                                                className="btn-free-sidebar" 
                                                onClick={() => handleFreeTable(table)}
                                                title="Free this table"
                                            >
                                                Free Table
                                            </button>
                                        )} */}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main Tables Grid */}
                <div className="main-tables-area">
                    {loading ? (
                        <div className="loading">Loading tables...</div>
                    ) : (
                        <div className="tables-grid">
                            {filteredTables.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🍽️</div>
                                    <h3>No tables found</h3>
                                    {(hasRole('ADMIN') || hasRole('MANAGER')) && (
                                        <p>Click "Add Table" to create your first table</p>
                                    )}
                                </div>
                            ) : (
                                filteredTables.map((table) => {
                                    const customer = getTableCustomer(table.tableNumber);
                                    const isOccupied = customer !== null; // Table is only occupied if there's an active (non-served) order
                                    
                                    return (
                                        <div 
                                            key={table.tableId} 
                                            className={`table-card ${getTableStatusClass(table)}`}
                                        >
                                            <div className="table-header">
                                                <div className="table-info">
                                                    <div className="table-icon">
                                                        {getTableIcon(table.capacity)}
                                                    </div>
                                                    <div className="table-details">
                                                        <h3 className="table-number">Table #{table.tableNumber}</h3>
                                                        <span className="table-capacity">👥 {table.capacity}</span>
                                                    </div>
                                                </div>
                                                {hasRole('ADMIN') && (
                                                    <button 
                                                        className="btn-delete-small" 
                                                        onClick={() => handleDelete(table.tableNumber)}
                                                        title="Delete table"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>

                                            <div className="table-status">
                                                {customer ? (
                                                    <div className="customer-info">
                                                        <div className="customer-name">👤 {customer}</div>
                                                        <span className="status-badge occupied">On Dine</span>
                                                    </div>
                                                ) : (
                                                    <div className="available-info">
                                                        <span className="status-badge available">Available</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="table-actions">
                                                {(hasRole('ADMIN') || hasRole('CASHIER') || hasRole('MANAGER')) && (
                                                    <>
                                                        {isOccupied ? (
                                                            <button 
                                                                className="btn-free" 
                                                                onClick={() => handleFreeTable(table)}
                                                            >
                                                                Free Table
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="btn-assign" 
                                                                onClick={() => openAssignModal(table)}
                                                                disabled={isPastDate()}
                                                                title={isPastDate() ? "Cannot create orders for past dates" : "Create order for this table"}
                                                            >
                                                                Create Order
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Table Modal */}
            <Modal isOpen={showModal} onClose={closeModal}>
                <h3 className="modal-title">Add New Table</h3>
                <div className="form-group">
                    <label className="form-label">Table Number</label>
                    <input
                        className="form-input"
                        type="number"
                        placeholder="Enter table number"
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Capacity</label>
                    <input
                        className="form-input"
                        type="number"
                        placeholder="Enter number of guests"
                        value={newCapacity}
                        onChange={(e) => setNewCapacity(e.target.value)}
                        min="1"
                    />
                </div>
                <div className="modal-buttons">
                    <button className="btn-cancel" onClick={closeModal}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleAdd}>
                        Add Table
                    </button>
                </div>
            </Modal>

            {/* Create Order Modal */}
            <CreateOrderModal 
                isOpen={showCreateOrderModal}
                onClose={() => setShowCreateOrderModal(false)}
                table={selectedTable}
            />

            {/* Delete Confirmation Popup */}
            <DeleteConfirmationPopup 
                isOpen={showDeletePopup}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                tableNumber={tableToDelete}
            />
        </div>
    );
}

export default Tables;