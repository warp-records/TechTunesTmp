

import logo from './assets/logo.png'
import './Start.css'

export default function Start() {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="logo-section">
          <img src={logo} alt="TechTunes" className="logo-image" />
        </div>

        <div className="account-type-selection">
          <h3>Get Started</h3>
          <div className="account-types">
            <AccountTypeButton action="create" icon="✨" title="Create Account"
              description="New to TechTunes? Sign up and start your musical journey!" />
            <AccountTypeButton action="freemium" icon="🎵" title="Try for Free"
              description="Explore TechTunes without creating an account!" />
            <AccountTypeButton action="login" icon="🔑" title="Login to Account"
              description="Already have an account? Sign in to continue your journey!" />
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountTypeButton({ action, icon, title, description }) {
  return (
    <button className="account-type-btn" data-action={action}>
      <div className="account-icon">{icon}</div>
      <div className="account-info">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </button>
  )
}
