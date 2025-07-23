import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import '../styles/Login.css'; // Reusing the same styles

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const roles = [
    { value: 'CASHIER', label: 'Cashier' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    console.log('Registration attempt for:', username);

    try {
      const res = await api.post('/api/auth/register', {
        username,
        password,
        role
      });

      console.log('Registration response:', res.data);

      // Show success message and redirect to login
      alert('Registration successful! Please login with your credentials.');
      navigate('/', { replace: true });

    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        setError(err.response.data.message || 'Registration failed');
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
            <p className="brand-tagline">
              Join our team and help manage restaurant operations efficiently
            </p>
            <div className="feature-highlights">
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>Team Collaboration</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔐</span>
                <span>Secure Access</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <span>Easy to Use</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Fast Performance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="login-form-panel">
          <div className="login-form-container">
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Join the UrbanZest team today</p>
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
                    placeholder="Choose a username" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={3}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Role</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <select 
                    className="form-input form-select"
                    value={role} 
                    onChange={e => setRole(e.target.value)}
                    required
                    disabled={isLoading}
                  >
                    {roles.map(roleOption => (
                      <option key={roleOption.value} value={roleOption.value}>
                        {roleOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input 
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
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

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"></span>
                  <input 
                    className="form-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              <p className="footer-text">
                Already have an account?{' '}
                <Link to="/" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;