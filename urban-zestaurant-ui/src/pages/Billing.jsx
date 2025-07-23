import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllBills, getBillsByOrderId, generateBill } from '../services/billingService';
import '../styles/Billing.css';

// Modal Component (matching your existing pattern)
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

function Billing() {
    const [bills, setBills] = useState([]);
    const [searchOrderId, setSearchOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [selectedBill, setSelectedBill] = useState(null);
    const [showBillModal, setShowBillModal] = useState(false);
    
    // Generate bill form state
    const [generateForm, setGenerateForm] = useState({
        orderId: '',
        paymentMethod: 'CASH',
        taxPercent: 10
    });

    const { user } = useContext(AuthContext);

    // Load all bills on component mount
    useEffect(() => {
        loadAllBills();
    }, []);

    const loadAllBills = async () => {
        try {
            setLoading(true);
            const response = await getAllBills();
            setBills(response.data);
        } catch (error) {
            console.error('Error loading bills:', error);
            alert('Error loading bills. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchOrderId.trim()) {
            loadAllBills();
            return;
        }

        try {
            setLoading(true);
            const response = await getBillsByOrderId(searchOrderId);
            setBills(response.data);
        } catch (error) {
            console.error('Error searching bills:', error);
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchOrderId('');
        loadAllBills();
    };

    const getDateFilteredBills = () => {
        if (dateFilter === 'all') return bills;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return bills.filter(bill => {
            const billDate = new Date(bill.paidAt);
            const billDateOnly = new Date(billDate.getFullYear(), billDate.getMonth(), billDate.getDate());
            
            switch (dateFilter) {
                case 'today':
                    return billDateOnly.getTime() === today.getTime();
                
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return billDate >= weekAgo;
                
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return billDate >= monthAgo;
                
                case 'custom':
                    if (!customDateRange.startDate || !customDateRange.endDate) return true;
                    const startDate = new Date(customDateRange.startDate);
                    const endDate = new Date(customDateRange.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    return billDate >= startDate && billDate <= endDate;
                
                default:
                    return true;
            }
        });
    };

    const getFilteredBills = () => {
        let filteredBills = getDateFilteredBills();
        
        // Apply payment method filter
        if (paymentMethodFilter !== 'all') {
            filteredBills = filteredBills.filter(bill => 
                bill.paymentMethod === paymentMethodFilter
            );
        }
        
        // Apply payment status filter
        if (paymentStatusFilter !== 'all') {
            filteredBills = filteredBills.filter(bill => 
                bill.paymentStatus === paymentStatusFilter
            );
        }
        
        return filteredBills;
    };

    const handleGenerateBill = async (e) => {
        e.preventDefault();
        
        if (!generateForm.orderId.trim()) {
            alert('Please enter an order ID');
            return;
        }

        try {
            setLoading(true);
            const response = await generateBill({
                orderId: parseInt(generateForm.orderId),
                paymentMethod: generateForm.paymentMethod,
                taxPercent: parseFloat(generateForm.taxPercent)
            });
            
            alert('Bill generated successfully!');
            setSelectedBill(response.data);
            setShowBillModal(true);
            
            setGenerateForm({
                orderId: '',
                paymentMethod: 'CASH',
                taxPercent: 10
            });
            
            loadAllBills();
        } catch (error) {
            console.error('Error generating bill:', error);
            alert('Error generating bill. Please check the order ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const getBillStats = () => {
        const filteredBills = getFilteredBills();
        const totalBills = filteredBills.length;
        const paidBills = filteredBills.filter(bill => bill.paymentStatus === 'PAID').length;
        const totalRevenue = filteredBills.reduce((sum, bill) => sum + parseFloat(bill.total), 0);
        
        return { totalBills, paidBills, totalRevenue };
    };

    const stats = getBillStats();

    return (
        <div className="billing-container">
            {/* Hero Header Section */}
            <div className="billing-hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            💳 Billing Management
                        </h1>
                        <p className="hero-subtitle">
                        </p>
                        
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">{stats.totalBills}</span>
                                <span className="stat-label">Total Bills</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{stats.paidBills}</span>
                                <span className="stat-label">Paid Bills</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">₹{stats.totalRevenue.toFixed(0)}</span>
                                <span className="stat-label">Total Revenue</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="hero-actions">
                        <button className="refresh-btn" onClick={loadAllBills} disabled={loading}>
                            {loading ? '⟳' : '↻'} Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="billing-content">
                <div className="content-header">
                    <h2 className="section-title">
                        🧾 Bills
                    </h2>
                    
                    <div className="header-controls">
                        <div className="billing-tabs">
                            <button 
                                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All Bills
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
                                onClick={() => setActiveTab('generate')}
                            >
                                Generate Bill
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bills Wrapper */}
                <div className="billing-wrapper">
                    {activeTab === 'all' && (
                        <div className="bills-section">
                            {/* Filters Section */}
                            <div className="filters-section">
                                <div className="filter-group">
                                    <label htmlFor="dateFilter">Filter by Date:</label>
                                    <select
                                        id="dateFilter"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label htmlFor="paymentMethodFilter">Payment Method:</label>
                                    <select
                                        id="paymentMethodFilter"
                                        value={paymentMethodFilter}
                                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All Methods</option>
                                        <option value="CASH">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="CARD">Card</option>
                                        <option value="ONLINE">Online</option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label htmlFor="paymentStatusFilter">Payment Status:</label>
                                    <select
                                        id="paymentStatusFilter"
                                        value={paymentStatusFilter}
                                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="PAID">Paid</option>
                                        <option value="PENDING">Pending</option>
                                    </select>
                                </div>

                                {dateFilter === 'custom' && (
                                    <div className="custom-date-range">
                                        <div className="date-input-group">
                                            <label htmlFor="startDate">From:</label>
                                            <input
                                                type="date"
                                                id="startDate"
                                                value={customDateRange.startDate}
                                                onChange={(e) => setCustomDateRange({
                                                    ...customDateRange,
                                                    startDate: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="date-input-group">
                                            <label htmlFor="endDate">To:</label>
                                            <input
                                                type="date"
                                                id="endDate"
                                                value={customDateRange.endDate}
                                                onChange={(e) => setCustomDateRange({
                                                    ...customDateRange,
                                                    endDate: e.target.value
                                                })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="filter-group">
                                    <label htmlFor="searchOrder">Search by Order ID:</label>
                                    <div className="search-input-group">
                                        <input
                                            type="number"
                                            id="searchOrder"
                                            placeholder="Enter Order ID"
                                            value={searchOrderId}
                                            onChange={(e) => setSearchOrderId(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <button onClick={handleSearch} disabled={loading} className="btn-search">
                                            🔍
                                        </button>
                                        {searchOrderId && (
                                            <button onClick={clearSearch} className="btn-clear">
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p>Loading bills...</p>
                                </div>
                            ) : getFilteredBills().length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📄</div>
                                    <h3>No Bills Found</h3>
                                    <p>
                                        {searchOrderId 
                                            ? `No bills found for Order ID: ${searchOrderId}` 
                                            : dateFilter !== 'all' 
                                            ? 'No bills found for the selected date range'
                                            : 'No bills have been generated yet. Start by generating your first bill!'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="bills-grid">
                                    {getFilteredBills().map(bill => (
                                        <div 
                                            key={bill.billId} 
                                            className="bill-card"
                                            onClick={() => { setSelectedBill(bill); setShowBillModal(true); }}
                                        >
                                            <div className="bill-header">
                                                <div className="bill-id">Bill #{bill.billId}</div>
                                                <div className="order-id">Order #{bill.orderId}</div>
                                            </div>
                                            
                                            <div className="bill-items">
                                                <div className="items-count">{bill.items.length} item(s)</div>
                                                <div className="bill-total">{formatCurrency(bill.total)}</div>
                                            </div>
                                            
                                            <div className="bill-footer">
                                                <div className="payment-info">
                                                    <span className={`payment-method ${bill.paymentMethod.toLowerCase()}`}>
                                                        {bill.paymentMethod}
                                                    </span>
                                                    <span className={`payment-status ${bill.paymentStatus.toLowerCase()}`}>
                                                        {bill.paymentStatus}
                                                    </span>
                                                </div>
                                                <div className="paid-at">{formatDateTime(bill.paidAt)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'generate' && (
                        <div className="generate-section">
                            <div className="generate-container">
                                <h3>Generate New Bill</h3>
                                <div className="generate-form">
                                    <div className="form-group">
                                        <label htmlFor="orderId">Order ID</label>
                                        <input
                                            type="number"
                                            id="orderId"
                                            value={generateForm.orderId}
                                            onChange={(e) => setGenerateForm({...generateForm, orderId: e.target.value})}
                                            required
                                            placeholder="Enter order ID"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="paymentMethod">Payment Method</label>
                                        <select
                                            id="paymentMethod"
                                            value={generateForm.paymentMethod}
                                            onChange={(e) => setGenerateForm({...generateForm, paymentMethod: e.target.value})}
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="UPI">UPI</option>
                                            <option value="CARD">Card</option>
                                            <option value="ONLINE">Online</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="taxPercent">Tax Percentage</label>
                                        <input
                                            type="number"
                                            id="taxPercent"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={generateForm.taxPercent}
                                            onChange={(e) => setGenerateForm({...generateForm, taxPercent: e.target.value})}
                                            required
                                            placeholder="Enter tax percentage"
                                        />
                                    </div>

                                    <button 
                                        type="button" 
                                        className="btn-primary" 
                                        disabled={loading}
                                        onClick={handleGenerateBill}
                                    >
                                        {loading ? 'Generating...' : '💳 Generate Bill'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bill Detail Modal */}
            <Modal isOpen={showBillModal} onClose={() => {setShowBillModal(false); setSelectedBill(null);}}>
                {selectedBill && (
                    <div className="bill-receipt">
                        <div className="modal-title">Bill Receipt</div>
                        
                        <div className="receipt-header">
                            <h4>Bill ID: #{selectedBill.billId}</h4>
                            <p>Order ID: #{selectedBill.orderId}</p>
                        </div>

                        <div className="receipt-details">
                            <div className="receipt-row">
                                <span>Payment Method:</span>
                                <span>{selectedBill.paymentMethod}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Payment Status:</span>
                                <span className={`payment-status ${selectedBill.paymentStatus.toLowerCase()}`}>
                                    {selectedBill.paymentStatus}
                                </span>
                            </div>
                            <div className="receipt-row">
                                <span>Paid At:</span>
                                <span>{formatDateTime(selectedBill.paidAt)}</span>
                            </div>
                        </div>

                        <div className="receipt-items">
                            <h5>Items</h5>
                            {selectedBill.items.map((item, index) => (
                                <div key={index} className="receipt-item">
                                    <div>
                                        <div className="item-name">{item.item}</div>
                                        <div className="item-meta">
                                            {item.quantity} × {formatCurrency(item.unitPrice)}
                                        </div>
                                    </div>
                                    <div className="item-total">{formatCurrency(item.total)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="receipt-totals">
                            <div className="receipt-row">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(selectedBill.subtotal)}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Tax:</span>
                                <span>{formatCurrency(selectedBill.tax)}</span>
                            </div>
                            <div className="receipt-row total">
                                <strong>Total:</strong>
                                <strong>{formatCurrency(selectedBill.total)}</strong>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Billing;