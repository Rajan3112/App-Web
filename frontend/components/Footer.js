import Link from 'next/link';
import styles from '../styles/Layout.module.css';

const Footer = ({ user }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>Mobiloitte</h3>
          <p>Project Management System</p>
          <p>Efficiently manage your projects and tasks with our powerful platform.</p>
          <p>Streamline collaboration and boost productivity across your organization.</p>
        </div>
        
        <div className={styles.footerSection}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/projects">Projects</Link></li>
            <li><Link href="/tasks">Tasks</Link></li>
            {(user && (user.role === 'admin' || user.role === 'manager')) && (
              <>
                <li><Link href="/users">Users</Link></li>
                <li><Link href="/settings">Settings</Link></li>
              </>
            )}
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h4>Contact Us</h4>
          <p>Email: support@mobiloitte.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Address: 123 Business Avenue, Suite 100<br />San Francisco, CA 94107</p>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Mobiloitte Technologies India Pvt Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;