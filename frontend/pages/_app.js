import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    console.log('Logout initiated');
    
    // Clear all authentication data
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    console.log('User data cleared, redirecting to login');
    
    // Simple and reliable redirect method
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Redirect to login if not authenticated and trying to access protected routes
  useEffect(() => {
    const protectedRoutes = ['/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => router.pathname.startsWith(route));
    
    if (!loading && isProtectedRoute && !user) {
      router.push('/login');
    }
  }, [user, router, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout user={user} logout={logout}>
      <Component {...pageProps} user={user} login={login} logout={logout} />
    </Layout>
  );
}

export default MyApp;