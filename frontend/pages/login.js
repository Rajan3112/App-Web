import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../utils/api';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import styles from '../styles/Login.module.css';

export default function Login({ login }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordEmail, setShowForgotPasswordEmail] = useState(false);
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmailState] = useState('');
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Please enter your email.';
    } else if (email.length > 50) {
      newErrors.email = 'Email must be no more than 50 characters.';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 5 || password.length > 50) {
      newErrors.password = 'Password must be between 5 and 50 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotPasswordEmail = () => {
    const newErrors = {};
    
    if (!forgotPasswordEmail) {
      newErrors.forgotEmail = 'Please enter your email.';
    } else if (forgotPasswordEmail.length > 50) {
      newErrors.forgotEmail = 'Email must be no more than 50 characters.';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(forgotPasswordEmail)) {
      newErrors.forgotEmail = 'Please enter a valid email address.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForgotPasswordEmail()) {
      // Check if the email is valid by trying the new endpoint
      try {
        const response = await fetch('http://localhost:5000/api/auth/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: forgotPasswordEmail })
        });
        
        const data = await response.json();
        console.log('Email check response:', response.status, data); // Debug log
        
        if (response.ok && data.isValid) {
          // Store the email in localStorage for the modal to use
          localStorage.setItem('forgotPasswordEmail', forgotPasswordEmail);
          setShowForgotPasswordEmail(false);
          setShowForgotPasswordForm(true);
        } else if (response.status === 404) {
          // User not found
          setErrors({ general: 'User not found.' });
        } else {
          // Other error
          setErrors({ general: data.message || 'Invalid email.' });
        }
      } catch (error) {
        console.error('Email check error:', error);
        setErrors({ general: 'Network error. Please try again.' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const data = await api.login({ email, password });

      if (data.token) {
        login(data, data.token);
      } else {
        // Handle different types of errors
        if (data.message) {
          setErrors({ general: data.message });
        } else {
          setErrors({ general: 'Login failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Login to User Login Dashboard</h1>
        
        {errors.general && (
          <div className="alert alert-danger">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className={`form-input ${errors.email ? styles.errorInput : ''}`}
              placeholder="Please enter your email."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength="50"
            />
            {errors.email && <div className={styles.errorText}>{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`form-input ${errors.password ? styles.errorInput : ''}`}
                placeholder="Please enter your password."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="5"
                maxLength="50"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-6.72A4.24 4.24 0 0 1 12 9c1.1 0 2 .9 2 2 0 .28-.07.54-.18.78"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <div className={styles.errorText}>{errors.password}</div>}
          </div>
          
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <button 
              type="button" 
              onClick={() => {
                setForgotPasswordEmailState(email);
                setShowForgotPasswordEmail(true);
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3498db', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Forgot Password?
            </button>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>Don't have an account?</p>
            <button 
              type="button" 
              onClick={() => router.push('/signup')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3498db', 
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              Sign Up Now
            </button>
          </div>
        </form>
      </div>
      
      {/* Forgot Password Email Input Modal */}
      {showForgotPasswordEmail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            padding: '2.5rem',
            width: '100%',
            maxWidth: '450px',
            color: '#333'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>Forgot Password</h2>
              <button 
                onClick={() => {
                  setShowForgotPasswordEmail(false);
                  setForgotPasswordEmailState('');
                  setErrors({});
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                &times;
              </button>
            </div>
            
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Please enter your email address to reset your password.
            </p>
            
            {errors.general && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', color: '#e74c3c' }}>
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group">
                <label htmlFor="forgotEmail" className="form-label">Email</label>
                <input
                  type="email"
                  id="forgotEmail"
                  className={`form-input ${errors.forgotEmail ? styles.errorInput : ''}`}
                  placeholder="Please enter your email."
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmailState(e.target.value)}
                  maxLength="50"
                />
                {errors.forgotEmail && <div className={styles.errorText}>{errors.forgotEmail}</div>}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForgotPasswordEmail(false);
                    setForgotPasswordEmailState('');
                    setErrors({});
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Forgot Password Form Modal */}
      {showForgotPasswordForm && (
        <ForgotPasswordModal 
          email={forgotPasswordEmail}
          onClose={() => {
            setShowForgotPasswordForm(false);
            setForgotPasswordEmailState('');
            localStorage.removeItem('forgotPasswordEmail');
          }}
          onPasswordChanged={() => {
            // Show success message and close modal
            alert('Password updated successfully. Please login with your new password.');
            setShowForgotPasswordForm(false);
            setForgotPasswordEmailState('');
            localStorage.removeItem('forgotPasswordEmail');
          }}
        />
      )}
    </div>
  );
}