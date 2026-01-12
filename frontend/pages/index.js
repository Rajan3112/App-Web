import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function Home({ user }) {
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Welcome To User Login Dashboard</title>
        <meta name="description" content="User Login Dashboard - Secure Login and Registration" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome To <span className={styles.highlight}>User Login Dashboard</span>
        </h1>

        {/* Adding marquee text as requested */}
        <marquee className={styles.marqueeText} behavior="scroll" direction="left" scrollamount="5">
          Welcome to User Login Dashboard - Your secure platform for user authentication and management. Register, verify your email, and access your personalized dashboard with ease.
        </marquee>

        <p className={styles.description}>
          Efficiently manage your projects and tasks with our powerful platform
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Project Management</h2>
            <p>Create, track, and manage projects with ease</p>
          </div>

          <div className={styles.card}>
            <h2>Task Tracking</h2>
            <p>Assign and monitor tasks for your team members</p>
          </div>

          <div className={styles.card}>
            <h2>Real-time Updates</h2>
            <p>Stay informed with live project status updates</p>
          </div>

          <div className={styles.card}>
            <h2>Role-based Access</h2>
            <p>Control access based on user roles and permissions</p>
          </div>
        </div>

        {!user && (
          <div className={styles.actions}>
            <Link href="/login">
              <button className="btn btn-primary">Login to Dashboard</button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}