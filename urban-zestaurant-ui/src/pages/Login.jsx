import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import '../styles/Login.css';
import { Link } from 'react-router-dom/dist';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Login attempt for:', username);

    try {
      const res = await api.post('/api/auth/login', {
        username, 
        password
      });

      console.log('Login response:', res.data);

      if (res.data.token) {
        login(res.data.token);
        console.log('Navigating to dashboard...');
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        setError(err.response.data.message || 'Invalid username or password');
      } else if (err.request) {
        setError('Unable to connect to server. Please try again.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Animation */}
      <div className="login-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className="login-content">
        {/* Left Panel - Branding */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="logo-icon">🍽️</div>
              <h1 className="brand-name">UrbanZest</h1>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form-panel">
          <div className="login-form-container">
            <div className="form-header">
              <h2 className="form-title">Welcome</h2>
              <p className="form-subtitle">Sign in to your account to continue</p>
            </div>
            
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label className="input-label">Username</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input 
                    className="form-input"
                    type="text"
                    placeholder="Enter your username" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input 
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              
              <button 
                className={`login-button ${isLoading ? 'loading' : ''}`}
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              <p className="footer-text">
               
              </p>
              <p className="footer-text">
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;