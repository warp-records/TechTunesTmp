import { Link } from 'react-router-dom';
import styles from './PremiumCard.module.css';

export default function PremiumCard({ onPricingPage = false, greenList = false }) {
  return (
    <div className={[styles.card, onPricingPage ? "" : styles["no-banner"]].join(" ")}>
      <div className={styles.title}>Premium</div>
      <div className={styles.description}>
        Everything you need plus exclusive features and content
      </div>
      <ul className={[styles.features, greenList ? styles["green-list"] : ""].join(" ")}>
        <li>All premium lessons</li>
        <li>Complete song library</li>
        <li>Personal chatbot</li>
        <li>Select your school; See your real time impact!</li>
        <li>Add &amp; Battle your friends!</li>
      </ul>
      {onPricingPage && (
        <Link to="/account_create">
          <button className={styles.button}>Go Premium</button>
        </Link>
      )}
    </div>
  );
}
