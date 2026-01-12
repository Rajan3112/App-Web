import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import styles from '../styles/Layout.module.css';

const Layout = ({ children, user, logout }) => {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Show footer on all pages except the login page and landing page
  const showFooter = router.pathname !== '/login' && router.pathname !== '/';

  const handleLogout = (e) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    console.log('Logout confirmed');
    setShowLogoutConfirm(false);
    
    // Simple and reliable logout method
    if (typeof logout === 'function') {
      logout();
    } else {
      // Direct fallback to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>User Login Dashboard</title>
        <meta name="description" content="User Login Dashboard - Secure Authentication" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/" className={styles.logoLink}>
            <Logo />
          </Link>
        </div>
        
        {user && (
          <nav className={styles.nav}>
            <Link href="/dashboard" className={router.pathname === '/dashboard' ? styles.active : ''}>
              Dashboard
            </Link>
            
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </nav>
        )}
      </header>

      <main className={styles.main}>
        {children}
      </main>

      {showFooter && <Footer user={user} />}
      
      {showLogoutConfirm && (
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
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%'
          }}>
            <p style={{ color: '#e74c3c', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Are you sure you want to logout?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                className="btn btn-secondary"
                onClick={cancelLogout}
                style={{ padding: '0.5rem 1rem' }}
              >
                No
              </button>
              <button 
                className="btn btn-danger"
                onClick={confirmLogout}
                style={{ padding: '0.5rem 1rem' }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;