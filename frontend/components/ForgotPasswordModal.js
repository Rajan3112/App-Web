import { useState } from 'react';
import styles from '../styles/Login.module.css';

export default function ForgotPasswordModal({ onClose, onPasswordChanged, user, email }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessScreen, setShowSuccessScreen] = useState(false); // New state for success screen
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // New Password validation
    if (!newPassword) {
      newErrors.newPassword = 'Please enter a new password.';
    } else if (newPassword.length < 5 || newPassword.length > 50) {
      newErrors.newPassword = 'Password must be between 5 and 50 characters.';
    }

    // Confirm Password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        email: user ? user.email : email,
        newPassword
      };

      // Include oldPassword only for self password change
      if (!user) {
        // For self password change, we would need to collect old password
        // But based on requirements, we're only collecting new password and confirm password
        // This would typically require a different flow with email verification
      }

      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && user && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Password updated successfully.');
        // Show success screen instead of automatically closing
        setShowSuccessScreen(true);
        // Clear form fields
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrors({ general: data.message || 'Failed to update password.' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle successful password change
  const handleSuccessClose = () => {
    if (onPasswordChanged) {
      onPasswordChanged();
    }
    onClose();
  };

  // If showing success screen, render a different UI
  if (showSuccessScreen) {
    return (
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
          color: '#333',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '60px',
            height: '60px',
            backgroundColor: '#27ae60',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          
          <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Success!</h2>
          
          <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '1.1rem' }}>
            Your password has been updated successfully.
          </p>
          
          <div style={{ 
            backgroundColor: '#e8f4ea', 
            border: '1px solid #27ae60', 
            borderRadius: '5px', 
            padding: '1rem', 
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#27ae60' }}>
              Next Steps:
            </p>
            <ol style={{ margin: '0', paddingLeft: '1.2rem', color: '#555' }}>
              <li>Close this window</li>
              <li>Go to the login page</li>
              <li>Enter your email and new password</li>
            </ol>
          </div>
          
          <button 
            onClick={handleSuccessClose}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  return (
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
          <h2 style={{ margin: 0, color: '#333' }}>
            {user ? `Change Password for ${user.name}` : 'Forgot Password'}
          </h2>
          <button 
            onClick={onClose}
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

        {errors.general && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem', color: '#e74c3c' }}>
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: '1rem', color: '#27ae60' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <div className={styles.passwordField}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                className={`form-input ${errors.newPassword ? styles.errorInput : ''}`}
                placeholder="Enter your new password."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength="5"
                maxLength="50"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
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
            {errors.newPassword && <div className={styles.errorText}>{errors.newPassword}</div>}
            <div className={styles.passwordHint}>
              Please enter a new password.
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className={styles.passwordField}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className={`form-input ${errors.confirmPassword ? styles.errorInput : ''}`}
                placeholder="Enter your confirm password."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength="5"
                maxLength="50"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && <div className={styles.errorText}>{errors.confirmPassword}</div>}
            <div className={styles.passwordHint}>
              Please confirm your password.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}