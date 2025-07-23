// TopNavbar.jsx - New independent top navigation
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const TopNavbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getUserInitials = (username) => {
        if (!username) return 'U';
        return username.charAt(0).toUpperCase();
    };

    return (
        <nav className="top-navbar">
            <div className="top-navbar-container">
                {/* Brand Section */}
                <Link to="/dashboard" className="top-navbar-brand">
                    <div className="top-brand-icon">🍽️</div>
                    <span className="top-brand-text">UrbanZest</span>
                </Link>

                {/* Search Bar */}
                <div className="top-search-section">
                    <div className="top-search-bar">
                        <span className="top-search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="top-search-input"
                        />
                    </div>
                </div>

                {/* User Section */}
                <div className="top-user-section">
                    <div className="top-user-info">
                        <div className="top-user-avatar">
                            {getUserInitials(user?.sub)}
                        </div>
                        <div className="top-user-details">
                        </div>
                    </div>
                    <button className="top-logout-btn" onClick={handleLogout}>
                        <span>🚪</span>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default TopNavbar;