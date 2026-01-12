import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';

export default function VerifyOTP({ login }) {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get email from query params
    if (router.query.email) {
      setEmail(router.query.email);
    } else {
      // If no email in query, redirect to signup
      router.push('/signup');
    }
  }, [router.query.email]);

  const validateForm = () => {
    const newErrors = {};

    // OTP validation
    if (!otp) {
      newErrors.otp = 'Please enter the OTP.';
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = 'OTP must be 6 digits.';
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

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // OTP verified successfully - show success message and redirect to login
        setErrors({ success: 'Email verified successfully! Please login to continue.' });
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setErrors({ general: data.message || 'OTP verification failed. Please try again.' });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setErrors({ success: 'OTP resent successfully. Please check your email.' });
      } else {
        setErrors({ general: data.message || 'Failed to resend OTP. Please try again.' });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Verify Your Email</h1>
        
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
          We've sent a 6-digit OTP to <strong>{email}</strong>
        </p>

        {errors.general && (
          <div className="alert alert-danger">
            {errors.general}
          </div>
        )}

        {errors.success && (
          <div className="alert alert-success" style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '0.75rem',
            borderRadius: '5px',
            marginBottom: '1rem'
          }}>
            {errors.success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp" className="form-label">Enter OTP</label>
            <input
              type="text"
              id="otp"
              className={`form-input ${errors.otp ? styles.errorInput : ''}`}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              style={{ 
                fontSize: '1.5rem', 
                letterSpacing: '0.5rem', 
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            />
            {errors.otp && <div className={styles.errorText}>{errors.otp}</div>}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>Didn't receive the OTP?</p>
            <button 
              type="button" 
              onClick={handleResendOTP}
              disabled={resending}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3498db', 
                cursor: resending ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textDecoration: 'underline',
                opacity: resending ? 0.5 : 1
              }}
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => router.push('/login')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#666', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
