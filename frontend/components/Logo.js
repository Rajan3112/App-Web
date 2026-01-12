import styles from '../styles/Logo.module.css';

const Logo = () => {
  return (
    <div className={styles.logo}>
      <span className={styles.letter}>U</span>
      <span className={styles.rest}>ser Login Dashboard</span>
    </div>
  );
};

export default Logo;