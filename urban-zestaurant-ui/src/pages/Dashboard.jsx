import React, { useContext, useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { getAllTables } from '../services/tableService';
import { getAllOrders } from '../services/orderService';
import { getAllBills, getMonthlyReport, getDailyReport } from '../services/billingService';
import '../styles/Dashboard.css';





const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dashboardData, setDashboardData] = useState({
        tables: [],
        orders: [],
        bills: [],
        loading: true
    });
    const [reportData, setReportData] = useState({
        daily: null,
        monthly: [],
        monthlyComparison: {
            currentMonth: [],
            previousMonth: [],
            loading: false
        },
        loading: false
    });
    const [reportFilters, setReportFilters] = useState({
        reportType: 'daily',
        date: new Date().toISOString().split('T')[0],
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        viewType: 'comparison'
    });

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Load dashboard data
    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Load reports on filter change
    useEffect(() => {
        loadReportData();
    }, [reportFilters]);

    const loadDashboardData = async () => {
        try {
            const [tablesRes, ordersRes, billsRes] = await Promise.all([
                getAllTables(),
                getAllOrders(),
                getAllBills()
            ]);

            setDashboardData({
                tables: tablesRes.data || [],
                orders: ordersRes.data || [],
                bills: billsRes.data || [],
                loading: false
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setDashboardData(prev => ({ ...prev, loading: false }));
        }
    };

    const loadReportData = async () => {
        setReportData(prev => ({ ...prev, loading: true }));

        try {
            if (reportFilters.reportType === 'daily') {
                console.log("Report filter date", reportFilters.date);
                const response = await getDailyReport(reportFilters.date);
                setReportData(prev => ({ ...prev, daily: response.data, loading: false }));
            } else if (reportFilters.viewType === 'comparison') {
                // Load current and previous month for comparison
                setReportData(prev => ({
                    ...prev,
                    monthlyComparison: { ...prev.monthlyComparison, loading: true }
                }));

                const currentMonthPromise = getMonthlyReport({
                    'year': reportFilters.year,
                    'month': reportFilters.month
                });

                // Calculate previous month
                const prevMonth = reportFilters.month === 1 ? 12 : reportFilters.month - 1;
                const prevYear = reportFilters.month === 1 ? reportFilters.year - 1 : reportFilters.year;

                const previousMonthPromise = getMonthlyReport({
                    'year': prevYear,
                    'month': prevMonth
                });

                const [currentResponse, previousResponse] = await Promise.all([
                    currentMonthPromise,
                    previousMonthPromise
                ]);

                setReportData(prev => ({
                    ...prev,
                    monthlyComparison: {
                        currentMonth: currentResponse.data || [],
                        previousMonth: previousResponse.data || [],
                        loading: false
                    },
                    loading: false
                }));
            } else {
                console.log("Report filter year", reportFilters.year);
                console.log("Report filter month", reportFilters.month);
                const response = await getMonthlyReport({ 'year': reportFilters.year, 'month': reportFilters.month })
                setReportData(prev => ({ ...prev, monthly: response.data, loading: false }));
            }
        } catch (error) {
            console.error('Error loading report data:', error);
            setReportData(prev => ({
                ...prev,
                loading: false,
                monthlyComparison: { ...prev.monthlyComparison, loading: false }
            }));
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Calculate real-time stats
    const getStats = () => {
        const { tables, orders, bills } = dashboardData;

        const totalTables = tables.length;
        const occupiedTables = tables.filter(table => table.status === 'occupied').length;
        const freeTables = tables.filter(table => table.status === 'free').length;

        const activeOrders = orders.filter(order =>
            ['PENDING', 'PREPARING'].includes(order.orderStatus?.toUpperCase())
        ).length;

        const todaysBills = bills.filter(bill => {
            const billDate = new Date(bill.paidAt).toDateString();
            const today = new Date().toDateString();
            return billDate === today;
        });

        const todaysRevenue = todaysBills.reduce((sum, bill) => sum + parseFloat(bill.total || 0), 0);
        const todaysOrders = todaysBills.length;

        return [
            {
                title: 'Total Tables',
                value: totalTables.toString(),
                change: `${freeTables} available`,
                trend: freeTables > 0 ? 'up' : 'down',
                icon: '🪑',
                color: 'blue'
            },
            {
                title: 'Active Orders',
                value: activeOrders.toString(),
                change: orders.length > 0 ? `${orders.length} total` : 'No orders',
                trend: activeOrders > 0 ? 'up' : 'neutral',
                icon: '📋',
                color: 'green'
            },
            {
                title: 'Revenue Today',
                value: formatCurrency(todaysRevenue),
                change: `${todaysOrders} orders`,
                trend: todaysRevenue > 0 ? 'up' : 'neutral',
                icon: '💰',
                color: 'purple'
            },
            {
                title: 'Table Occupancy',
                value: `${Math.round((occupiedTables / totalTables) * 100) || 0}%`,
                change: `${occupiedTables}/${totalTables} occupied`,
                trend: occupiedTables > totalTables / 2 ? 'up' : 'down',
                icon: '✅',
                color: 'orange'
            }
        ];
    };

    const stats = getStats();

    const prepareChartData = () => {
        const maxLength = Math.max(
            reportData.monthlyComparison.currentMonth.length,
            reportData.monthlyComparison.previousMonth.length
        );

        return Array.from({ length: maxLength }, (_, i) => {
            const current = reportData.monthlyComparison.currentMonth[i] || {};
            const previous = reportData.monthlyComparison.previousMonth[i] || {};

            return {
                day: `Day ${i + 1}`,
                currentRevenue: current.totalRevenue || 0,
                previousRevenue: previous.totalRevenue || 0
            };
        });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: "#ffffff",
                    border: "1px solid #e0f2f1",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                    <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
                    <p style={{ margin: 0, color: "#26a69a" }}>
                        📘 Current: ₹{payload[0].value.toFixed(2)}
                    </p>
                    <p style={{ margin: 0, color: "#90a4ae" }}>
                        📙 Previous: ₹{payload[1].value.toFixed(2)}
                    </p>
                </div>
            );
        }

        return null;
    };


    return (
        <div className="dashboard-container">
            {/* Compact Welcome Section */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="welcome-info">
                        <h1 className="welcome-title">
                            {getGreeting()}, {user?.sub || user?.username}!
                        </h1>
                        <div className="user-meta">
                            <span className="user-role">{user?.role}</span>
                            <span className="current-time">{formatDate(currentTime)} • {formatTime(currentTime)}</span>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            className="refresh-btn"
                            onClick={loadDashboardData}
                            disabled={dashboardData.loading}
                            title="Refresh Data"
                        >
                            {dashboardData.loading ? '⟳' : '↻'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="stats-section">
                <div className="enhanced-stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className={`enhanced-stat-card stat-${stat.color}`}>
                            <div className="stat-badge">
                                <span className="stat-icon-large">{stat.icon}</span>
                            </div>
                            <div className="stat-body">
                                <div className="stat-main">
                                    <h3 className="stat-value-large">{stat.value}</h3>
                                    <p className="stat-label">{stat.title}</p>
                                </div>
                                <div className={`stat-indicator trend-${stat.trend}`}>
                                    <span className="trend-arrow">
                                        {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'}
                                    </span>
                                    <span className="trend-text">{stat.change}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enhanced Reports Section */}
            <div className="reports-section">
                <div className="reports-header">
                    <h2 className="section-title">📈 Reports & Analytics</h2>
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${reportFilters.viewType === 'comparison' ? 'active' : ''}`}
                            onClick={() => setReportFilters(prev => ({ ...prev, viewType: 'comparison' }))}
                        >
                            📊 Comparison
                        </button>
                        <button
                            className={`toggle-btn ${reportFilters.viewType === 'detailed' ? 'active' : ''}`}
                            onClick={() => setReportFilters(prev => ({ ...prev, viewType: 'detailed' }))}
                        >
                            📋 Detailed
                        </button>
                    </div>
                </div>

                {/* Enhanced Report Filters */}
                <div className="enhanced-filters">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${reportFilters.reportType === 'daily' ? 'active' : ''}`}
                            onClick={() => setReportFilters(prev => ({ ...prev, reportType: 'daily' }))}
                        >
                            📅 Daily
                        </button>
                        <button
                            className={`filter-tab ${reportFilters.reportType === 'monthly' ? 'active' : ''}`}
                            onClick={() => setReportFilters(prev => ({ ...prev, reportType: 'monthly' }))}
                        >
                            📊 Monthly
                        </button>
                    </div>

                    <div className="filter-controls">
                        {reportFilters.reportType === 'daily' && (
                            <div className="filter-group">
                                <label htmlFor="date">Select Date:</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={reportFilters.date}
                                    onChange={(e) => setReportFilters(prev => ({
                                        ...prev,
                                        date: e.target.value
                                    }))}
                                    className="enhanced-input"
                                />
                            </div>
                        )}

                        {reportFilters.reportType === 'monthly' && (
                            <div className="filter-row">
                                <div className="filter-group">
                                    <label htmlFor="year">Year:</label>
                                    <select
                                        id="year"
                                        value={reportFilters.year}
                                        onChange={(e) => setReportFilters(prev => ({
                                            ...prev,
                                            year: parseInt(e.target.value)
                                        }))}
                                        className="enhanced-select"
                                    >
                                        {[2023, 2024, 2025, 2026].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label htmlFor="month">Month:</label>
                                    <select
                                        id="month"
                                        value={reportFilters.month}
                                        onChange={(e) => setReportFilters(prev => ({
                                            ...prev,
                                            month: parseInt(e.target.value)
                                        }))}
                                        className="enhanced-select"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(2023, i).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Report Content */}
                <div className="enhanced-report-content">
                    {(reportData.loading || reportData.monthlyComparison.loading) ? (
                        <div className="report-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading analytics data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Comparison View */}
                            {reportFilters.reportType === 'monthly' && reportFilters.viewType === 'comparison' && (
                                <div className="comparison-view">
                                    <div className="comparison-header">
                                        <h3>Monthly Revenue Comparison</h3>
                                        <p className="comparison-subtitle">
                                            Comparing {new Date(reportFilters.year, reportFilters.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} vs Previous Month
                                        </p>
                                    </div>

                                    <div className="comparison-charts">
                                        {/* Revenue Chart */}
                                        <div className="chart-container">
                                            <div className="chart-header">
                                                <h4>📈 Revenue Trends</h4>
                                            </div>
                                            <div className="revenue-chart">
                                                <h4 style={{ marginBottom: "12px", color: "#263238" }}>📊 Revenue Comparison (Bar Chart)</h4>
                                                <ResponsiveContainer width="100%" height={320}>
                                                    <BarChart
                                                        data={prepareChartData()}
                                                        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                                        <YAxis tick={{ fontSize: 12 }} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend verticalAlign="top" />
                                                        <Bar
                                                            dataKey="currentRevenue"
                                                            fill="#26a69a"
                                                            radius={[4, 4, 0, 0]}
                                                            name="Current Month"
                                                        />
                                                        <Bar
                                                            dataKey="previousRevenue"
                                                            fill="#90a4ae"
                                                            radius={[4, 4, 0, 0]}
                                                            name="Previous Month"
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>


                                        </div>

                                        {/* Summary Cards */}
                                        <div className="comparison-summary">
                                            {(() => {
                                                const currentTotal = reportData.monthlyComparison.currentMonth.reduce((sum, day) => sum + day.totalRevenue, 0);
                                                const previousTotal = reportData.monthlyComparison.previousMonth.reduce((sum, day) => sum + day.totalRevenue, 0);
                                                const growth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100) : 0;

                                                return (
                                                    <>
                                                        <div className="summary-card current">
                                                            <div className="card-header">
                                                                <span className="card-icon">📊</span>
                                                                <span className="card-title">Current Month</span>
                                                            </div>
                                                            <div className="card-value">{formatCurrency(currentTotal)}</div>
                                                            <div className="card-subtitle">
                                                                {reportData.monthlyComparison.currentMonth.length} days of data
                                                            </div>
                                                        </div>

                                                        <div className="summary-card previous">
                                                            <div className="card-header">
                                                                <span className="card-icon">📋</span>
                                                                <span className="card-title">Previous Month</span>
                                                            </div>
                                                            <div className="card-value">{formatCurrency(previousTotal)}</div>
                                                            <div className="card-subtitle">
                                                                {reportData.monthlyComparison.previousMonth.length} days of data
                                                            </div>
                                                        </div>

                                                        <div className={`summary-card growth ${growth >= 0 ? 'positive' : 'negative'}`}>
                                                            <div className="card-header">
                                                                <span className="card-icon">{growth >= 0 ? '📈' : '📉'}</span>
                                                                <span className="card-title">Growth</span>
                                                            </div>
                                                            <div className="card-value">
                                                                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                                                            </div>
                                                            <div className="card-subtitle">
                                                                {growth >= 0 ? 'Increase' : 'Decrease'} vs last month
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Daily Report */}
                            {reportFilters.reportType === 'daily' && reportData.daily && (
                                <div className="daily-report">
                                    <h3>Daily Report - {new Date(reportData.daily.date).toLocaleDateString()}</h3>
                                    <div className="report-stats">
                                        <div className="report-stat">
                                            <span className="report-icon">📋</span>
                                            <div className="report-details">
                                                <h4>{reportData.daily.totalOrders}</h4>
                                                <p>Total Orders</p>
                                            </div>
                                        </div>
                                        <div className="report-stat">
                                            <span className="report-icon">💰</span>
                                            <div className="report-details">
                                                <h4>{formatCurrency(reportData.daily.totalRevenue)}</h4>
                                                <p>Total Revenue</p>
                                            </div>
                                        </div>
                                        <div className="report-stat">
                                            <span className="report-icon">🧾</span>
                                            <div className="report-details">
                                                <h4>{formatCurrency(reportData.daily.totalTax)}</h4>
                                                <p>Total Tax</p>
                                            </div>
                                        </div>
                                        <div className="report-stat">
                                            <span className="report-icon">📊</span>
                                            <div className="report-details">
                                                <h4>{formatCurrency(reportData.daily.totalRevenue - reportData.daily.totalTax)}</h4>
                                                <p>Net Revenue</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Detailed Monthly Report */}
                            {reportFilters.reportType === 'monthly' && reportFilters.viewType === 'detailed' && reportData.monthly.length > 0 && (
                                <div className="monthly-report">
                                    <h3>Monthly Report - {new Date(reportFilters.year, reportFilters.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>

                                    {/* Monthly Summary */}
                                    <div className="monthly-summary">
                                        {(() => {
                                            const totalOrders = reportData.monthly.reduce((sum, day) => sum + day.totalOrders, 0);
                                            const totalRevenue = reportData.monthly.reduce((sum, day) => sum + day.totalRevenue, 0);
                                            const totalTax = reportData.monthly.reduce((sum, day) => sum + day.totalTax, 0);

                                            return (
                                                <div className="report-stats">
                                                    <div className="report-stat">
                                                        <span className="report-icon">📋</span>
                                                        <div className="report-details">
                                                            <h4>{totalOrders}</h4>
                                                            <p>Total Orders</p>
                                                        </div>
                                                    </div>
                                                    <div className="report-stat">
                                                        <span className="report-icon">💰</span>
                                                        <div className="report-details">
                                                            <h4>{formatCurrency(totalRevenue)}</h4>
                                                            <p>Total Revenue</p>
                                                        </div>
                                                    </div>
                                                    <div className="report-stat">
                                                        <span className="report-icon">🧾</span>
                                                        <div className="report-details">
                                                            <h4>{formatCurrency(totalTax)}</h4>
                                                            <p>Total Tax</p>
                                                        </div>
                                                    </div>
                                                    <div className="report-stat">
                                                        <span className="report-icon">📈</span>
                                                        <div className="report-details">
                                                            <h4>{Math.round(totalOrders / reportData.monthly.length)}</h4>
                                                            <p>Avg. Orders/Day</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Daily Breakdown Table */}
                                    <div className="monthly-breakdown">
                                        <h4>Daily Breakdown</h4>
                                        <div className="report-table">
                                            <div className="table-header">
                                                <div>Date</div>
                                                <div>Orders</div>
                                                <div>Revenue</div>
                                                <div>Tax</div>
                                                <div>Net</div>
                                            </div>
                                            {reportData.monthly.map((day, index) => (
                                                <div key={index} className="table-row">
                                                    <div>{new Date(day.date).toLocaleDateString()}</div>
                                                    <div>{day.totalOrders}</div>
                                                    <div>{formatCurrency(day.totalRevenue)}</div>
                                                    <div>{formatCurrency(day.totalTax)}</div>
                                                    <div>{formatCurrency(day.totalRevenue - day.totalTax)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No Data State */}
                            {((reportFilters.reportType === 'daily' && !reportData.daily) ||
                                (reportFilters.reportType === 'monthly' && reportFilters.viewType === 'detailed' && reportData.monthly.length === 0) ||
                                (reportFilters.reportType === 'monthly' && reportFilters.viewType === 'comparison' && reportData.monthlyComparison.currentMonth.length === 0)) && (
                                    <div className="no-data">
                                        <div className="no-data-icon">📊</div>
                                        <h3>No Data Available</h3>
                                        <p>No report data found for the selected period.</p>
                                    </div>
                                )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;