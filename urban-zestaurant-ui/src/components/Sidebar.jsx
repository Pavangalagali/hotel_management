// SideNavbar.jsx - Compact side navigation
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SideNavbar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

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
        }
    ];

    // Filter navigation items based on user role
    const allowedNavItems = navItems.filter(item => 
        item.roles.includes(user?.role)
    );

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="side-navbar">
            <nav className="side-nav">
                {allowedNavItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`side-nav-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <span className="side-nav-icon">{item.icon}</span>
                        <span className="side-nav-label">{item.label}</span>
                        {isActive(item.path) && <div className="side-active-indicator"></div>}
                    </Link>
                ))}
                
                {/* Footer Items */}
                <div className="side-nav-footer">
                    <Link to="/settings" className="side-footer-link">
                        <span className="side-nav-icon">⚙️</span>
                        <span className="side-nav-label">Settings</span>
                    </Link>
                    <Link to="/help" className="side-footer-link">
                        <span className="side-nav-icon">❓</span>
                        <span className="side-nav-label">Help</span>
                    </Link>
                </div>
            </nav>
        </aside>
    );
};

export default SideNavbar;