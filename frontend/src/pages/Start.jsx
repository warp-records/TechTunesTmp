import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'
import styles from './Start.module.css'

export default function Start() {
  return (
    <div className={styles['welcome-container']}>
      <div className={styles['welcome-card']}>
        <div className={styles['logo-section']}>
          <img src={logo} alt="TechTunes" className={styles['logo-image']} />
        </div>

        <div className={styles['account-type-selection']}>
          <h3>Get Started</h3>
          <div className={styles['account-types']}>
            <Link to="/onboard">
              <button className={styles['account-type-btn']} data-action="create">
                <div className={styles['account-icon']}>✨</div>
                <div className={styles['account-info']}>
                  <h4>Create Account</h4>
                  <p>New to TechTunes? Sign up and start your musical journey!</p>
                </div>
              </button>
            </Link>
            <Link to="/pickbot_edit">
              <button className={styles['account-type-btn']} data-action="freemium">
                <div className={styles['account-icon']}>🎵</div>
                <div className={styles['account-info']}>
                  <h4>Try for Free</h4>
                  <p>Explore TechTunes without creating an account!</p>
                </div>
              </button>
            </Link>
            <button className={styles['account-type-btn']} data-action="login">
              <div className={styles['account-icon']}>🔑</div>
              <div className={styles['account-info']}>
                <h4>Login to Account</h4>
                <p>Already have an account? Sign in to continue your journey!</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
