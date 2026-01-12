import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard({ user, login }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || ''
      });
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Please enter your name.';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - restore original data
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile
      });
      setErrors({});
    }
    setIsEditing(!isEditing);
    setSuccessMessage('');
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
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage and state with new user data
        const updatedUser = {
          ...user,
          name: data.name,
          email: data.email,
          mobile: data.mobile
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update user in parent component if login function is available
        if (login) {
          login(updatedUser, localStorage.getItem('token'));
        }
        
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrors({ general: data.message || 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {user.name}! 👋</h1>
        <p className={styles.subtitle}>You are successfully logged in to your dashboard</p>
      </div>
      
      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles.usersCard}`}>
          <div className={styles.statIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3>Your Profile</h3>
          
          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}
          
          {errors.general && (
            <div className={styles.errorMessage}>
              {errors.general}
            </div>
          )}
          
          {!isEditing ? (
            <>
              <p className={styles.userInfo}><strong>Name:</strong> {user.name}</p>
              <p className={styles.userInfo}><strong>Email:</strong> {user.email}</p>
              <p className={styles.userInfo}><strong>Mobile:</strong> {user.mobile || 'Not provided'}</p>
              <p className={styles.userInfo}><strong>Role:</strong> {user.role}</p>
              
              <button 
                className="btn btn-primary" 
                onClick={handleEditToggle}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                ✏️ Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className={styles.editForm}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${errors.name ? styles.errorInput : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
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
                  value={formData.email}
                  onChange={handleInputChange}
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
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="e.g., +1234567890"
                />
                {errors.mobile && <div className={styles.errorText}>{errors.mobile}</div>}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? '💾 Saving...' : '💾 Save'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleEditToggle}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className={styles.sections}>
        <div className={`${styles.card} ${styles.welcomeSection}`}>
          <div className={styles.welcomeContent}>
            <h2>🎉 Your Dashboard is Ready!</h2>
            <p>You have successfully signed up and verified your email.</p>
            <p>This is your personal dashboard where you can view and edit your profile information.</p>
            
            <div className={styles.infoBox}>
              <h3>✅ What's Working:</h3>
              <ul>
                <li>✓ User Registration with Email</li>
                <li>✓ 6-Digit OTP Verification</li>
                <li>✓ Secure Login System</li>
                <li>✓ Personal Dashboard</li>
                <li>✓ Profile Edit (Real-time Update)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
