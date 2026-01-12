import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Please enter your full name.';
    } else if (formData.name.length > 150) {
      newErrors.name = 'Name must be no more than 150 characters.';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Please enter your email.';
    } else if (formData.email.length > 50) {
      newErrors.email = 'Email must be no more than 50 characters.';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Mobile validation
    if (!formData.mobile) {
      newErrors.mobile = 'Please enter your mobile number.';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number (e.g., +1234567890).';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Please enter your password.';
    } else if (formData.password.length < 5 || formData.password.length > 50) {
      newErrors.password = 'Password must be between 5 and 50 characters.';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
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

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.requiresOTP) {
        // Redirect to OTP verification page
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        setErrors({ general: data.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Sign Up for User Login Dashboard</h1>
        
        {errors.general && (
          <div className="alert alert-danger">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? styles.errorInput : ''}`}
              placeholder="Please enter your full name."
              value={formData.name}
              onChange={handleChange}
              maxLength="150"
            />
            {errors.name && <div className={styles.errorText}>{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? styles.errorInput : ''}`}
              placeholder="Please enter your email."
              value={formData.email}
              onChange={handleChange}
              maxLength="50"
            />
            {errors.email && <div className={styles.errorText}>{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="mobile" className="form-label">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              className={`form-input ${errors.mobile ? styles.errorInput : ''}`}
              placeholder="e.g., +1234567890"
              value={formData.mobile}
              onChange={handleChange}
            />
            {errors.mobile && <div className={styles.errorText}>{errors.mobile}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`form-input ${errors.password ? styles.errorInput : ''}`}
                placeholder="Please enter your password."
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className={styles.passwordField}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? styles.errorInput : ''}`}
                placeholder="Please confirm your password."
                value={formData.confirmPassword}
                onChange={handleChange}
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
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>Already have an account?</p>
            <button 
              type="button" 
              onClick={() => router.push('/login')}
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
              Login Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
