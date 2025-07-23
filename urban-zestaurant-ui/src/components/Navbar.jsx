import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Navigation items with role-based access
    const navItems = [
        {
            path: '/dashboard',
            label: 'Dashboard',
            icon: '📊',
            roles: ['ADMIN', 'MANAGER', 'CASHIER']
        },
        {
            path: '/orders',
            label: 'Order Line',
            icon: '📋',
            roles: ['ADMIN', 'MANAGER', 'CASHIER']
        },
        {
            path: '/tables',
            label: 'Manage Table',
            icon: '🪑',
            roles: ['ADMIN', 'MANAGER', 'CASHIER']
        },
        {
            path: '/menu',
            label: 'Manage Dishes',
            icon: '🍽️',
            roles: ['ADMIN', 'MANAGER']
        },
        {
            path: '/billing',
            label: 'Billing',
            icon: '💳',
            roles: ['ADMIN', 'MANAGER', 'CASHIER']
        },
        {
            path: '/add-user',
            label: 'Customers',
            icon: '👥',
            roles: ['ADMIN']
        }
    ];

    // Filter navigation items based on user role
    const allowedNavItems = navItems.filter(item => 
        item.roles.includes(user?.role)
    );

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sidebar-nav">
            <div className="sidebar-content">
                {/* Header Section - Only Logo */}
                <div className="sidebar-header">
                    <Link to="/dashboard" className="sidebar-brand">
                        <div className="brand-icon">🍽️</div>
                        <span className="brand-text">Tasty Station</span>
                    </Link>
                </div>

                {/* Main Navigation */}
                <div className="sidebar-menu">
                    {allowedNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            <span className="menu-text">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="sidebar-footer">
                    <div className="menu-item">
                        <span className="menu-icon">⚙️</span>
                        <span className="menu-text">Settings</span>
                    </div>
                    <div className="menu-item">
                        <span className="menu-icon">❓</span>
                        <span className="menu-text">Help Center</span>
                    </div>
                    <button className="menu-item logout-item" onClick={handleLogout}>
                        <span className="menu-icon">🚪</span>
                        <span className="menu-text">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;