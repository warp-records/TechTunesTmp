import logo from '../assets/logo.png'
import AccountTypeButton from '../components/AccountTypeButton'
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
              <AccountTypeButton action="create" icon="✨" title="Create Account"
                description="New to TechTunes? Sign up and start your musical journey!" />
            </Link>
            <Link to="/create">
              <AccountTypeButton action="freemium" icon="🎵" title="Try for Free"
                description="Explore TechTunes without creating an account!" />
            </Link>
            <AccountTypeButton action="login" icon="🔑" title="Login to Account"
              description="Already have an account? Sign in to continue your journey!" />
          </div>
        </div>
      </div>
    </div>
  )
}
